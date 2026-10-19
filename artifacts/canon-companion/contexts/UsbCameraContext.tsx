import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, NativeEventEmitter, NativeModules, Platform } from 'react-native';

export interface UsbCameraDevice {
  id: string;
  name: string;
  vendorId: number;
  productId: number;
  supported: boolean;
}
export interface CapturedImage {
  uri: string;
  name: string;
  bytes: number;
  createdAt: number;
  mimeType: 'image/jpeg';
}
type State = 'disconnected' | 'permission' | 'connecting' | 'connected' | 'capturing' | 'downloading' | 'disconnecting';
interface NativeUsb {
  getDevices(): Promise<UsbCameraDevice[]>;
  getConnection(): Promise<UsbCameraDevice | null>;
  connect(id: string): Promise<UsbCameraDevice>;
  disconnect(): Promise<void>;
  capture(): Promise<CapturedImage>;
  getLastCapture(): Promise<CapturedImage | null>;
}
interface CameraContextValue {
  available: boolean;
  devices: UsbCameraDevice[];
  device: UsbCameraDevice | null;
  state: State;
  busy: boolean;
  scanning: boolean;
  message: string;
  error: string | null;
  progress: number;
  lastCapture: CapturedImage | null;
  scan(): Promise<void>;
  connect(id: string): Promise<void>;
  disconnect(): Promise<void>;
  capture(): Promise<void>;
}

const native: NativeUsb | undefined = Platform.OS === 'android' ? NativeModules.CanonUsb : undefined;
const CameraContext = createContext<CameraContextValue | null>(null);
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function UsbCameraProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<UsbCameraDevice[]>([]);
  const [device, setDevice] = useState<UsbCameraDevice | null>(null);
  const [state, setState] = useState<State>('disconnected');
  const [message, setMessage] = useState('Connect the powered-on EOS 6D using a USB OTG data cable.');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [lastCapture, setLastCapture] = useState<CapturedImage | null>(null);
  const epoch = useRef(0);
  // A synchronous lock prevents rapid double taps before React commits a render.
  const pending = useRef(false);

  const scan = useCallback(async () => {
    if (!native) return;
    setScanning(true);
    setError(null);
    try { setDevices(await native.getDevices()); }
    catch (e) { setError(errorText(e)); }
    finally { setScanning(false); }
  }, []);

  useEffect(() => {
    if (!native) return;
    let mounted = true;
    const emitter = new NativeEventEmitter(NativeModules.CanonUsb);
    const subscription = emitter.addListener('CanonUsbState', (event: { state: State; message: string; progress: number }) => {
      if (!mounted) return;
      setMessage(event.message);
      setProgress(event.progress);
      setState(event.state);
      if (event.state === 'disconnected') {
        epoch.current++;
        setDevice(null);
      }
    });
    async function reconcile() {
      if (!native) return;
      try {
        const [current, image] = await Promise.all([native.getConnection(), native.getLastCapture()]);
        if (!mounted) return;
        setDevice(current);
        setLastCapture(image);
        setState(current ? 'connected' : 'disconnected');
      } catch (e) { if (mounted) setError(errorText(e)); }
    }
    void reconcile();
    void scan();
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active' && !pending.current) { void reconcile(); void scan(); }
    });
    return () => {
      mounted = false;
      subscription.remove();
      appState.remove();
    };
  }, [scan]);

  async function connect(id: string) {
    if (!native || pending.current) return;
    pending.current = true;
    const operation = ++epoch.current;
    setError(null); setState('connecting'); setMessage('Requesting Android USB access…');
    try {
      const connected = await native.connect(id);
      if (operation === epoch.current) { setDevice(connected); setState('connected'); }
    } catch (e) {
      setError(errorText(e));
      if (operation === epoch.current) { setDevice(null); setState('disconnected'); }
    } finally { pending.current = false; }
  }
  async function disconnect() {
    if (!native || pending.current) return;
    pending.current = true;
    ++epoch.current;
    setError(null); setState('disconnecting');
    try { await native.disconnect(); setDevice(null); setState('disconnected'); }
    catch (e) { setError(errorText(e)); setState('disconnected'); setDevice(null); }
    finally { pending.current = false; }
  }
  async function capture() {
    if (!native || pending.current || !device || state !== 'connected') return;
    pending.current = true;
    const operation = ++epoch.current;
    setError(null); setState('capturing'); setProgress(0);
    try {
      const image = await native.capture();
      // A detach can occur after saving. Keep the saved image, but do not resurrect the connection.
      setLastCapture(image);
      if (operation === epoch.current) setState('connected');
    } catch (e) {
      setError(errorText(e));
      setDevice(null); setState('disconnected');
    } finally { pending.current = false; }
  }

  const busy = state !== 'connected' && state !== 'disconnected';
  return (
    <CameraContext.Provider value={{
      available: !!native, devices, device, state, busy, scanning, message, error,
      progress, lastCapture, scan, connect, disconnect, capture,
    }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useUsbCamera() {
  const context = useContext(CameraContext);
  if (!context) throw new Error('useUsbCamera requires UsbCameraProvider.');
  return context;
}
