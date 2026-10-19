import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Image } from 'expo-image';
import { useUsbCamera } from '@/contexts/UsbCameraContext';

function StatusPill() {
  const colors = useColors();
  const camera = useUsbCamera();
  return (
    <View style={[styles.statusPill, { backgroundColor: colors.accent }]}>
      <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.statusPillText, { color: colors.foreground }]}>
        {!camera.available ? 'NATIVE BUILD NEEDED' : camera.state === 'connected' ? 'USB CONNECTED' : camera.busy ? 'USB BUSY' : 'USB OFFLINE'}
      </Text>
    </View>
  );
}

function SetupSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useColors();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView
          edges={['bottom']}
          style={[styles.sheet, { backgroundColor: colors.card }]}
        >
          <View style={[styles.sheetGrabber, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleGroup}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                FIRST CONNECTION
              </Text>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                Set up your EOS 6D
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close setup"
              onPress={onClose}
              style={styles.closeButton}
              testID="close-camera-setup"
            >
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.sheetDescription, { color: colors.mutedForeground }]}>
            Use an Android device with USB host / OTG support and a USB data cable
            for the original Canon EOS 6D. No camera Wi-Fi connection is needed.
          </Text>

          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                <Text style={[styles.stepNumberText, { color: colors.primary }]}>
                  01
                </Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  On the camera
                </Text>
                <Text style={[styles.stepBody, { color: colors.mutedForeground }]}>
                  Turn Wi-Fi off on the 6D. Insert a writable SD card, choose JPEG
                  or RAW+JPEG and single-shot drive mode, then turn the camera on.
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                <Text style={[styles.stepNumberText, { color: colors.primary }]}>
                  02
                </Text>
              </View>
              <View style={styles.stepCopy}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                  On this device
                </Text>
                <Text style={[styles.stepBody, { color: colors.mutedForeground }]}>
                  Connect an OTG adapter to Android and a data-capable Mini-USB
                  cable to the 6D’s digital terminal. Scan, select the camera,
                  and allow the Android USB access prompt.
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.protocolNote, { borderColor: colors.border }]}>
            <Feather name="info" size={17} color={colors.primary} />
            <Text style={[styles.protocolNoteText, { color: colors.mutedForeground }]}>
              Keep the app in the foreground. USB control requires a native
              Android build containing this app’s USB module; browsers and Expo
              Go cannot access it. Hardware compatibility is not yet verified.
            </Text>
          </View>

          <View style={[styles.platformNotice, { backgroundColor: colors.accent }]}>
            <Text style={[styles.platformNoticeText, { color: colors.mutedForeground }]}>
              Close other camera-control apps before connecting. Camera photos
              stay on the SD card; downloaded JPEGs are saved privately on Android.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.dismissButton}
            testID="dismiss-setup"
          >
            <Text style={[styles.dismissButtonText, { color: colors.mutedForeground }]}>
              Close setup
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function CameraScreen() {
  const colors = useColors();
  const camera = useUsbCamera();
  const insets = useSafeAreaInsets();
  const [setupVisible, setSetupVisible] = useState(false);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  async function showSetup() {
    await Haptics.selectionAsync();
    setSetupVisible(true);
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline}>
          <View style={styles.brand}>
            <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
              <Feather name="aperture" size={21} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.brandName, { color: colors.foreground }]}>
                FIELDLINK
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.mutedForeground }]}>
                CAMERA COMPANION
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            CAMERA
          </Text>
          <StatusPill />
        </View>
        <Text style={[styles.modelName, { color: colors.foreground }]}>
          Canon EOS 6D
        </Text>
        <Text style={[styles.modelSubline, { color: colors.mutedForeground }]}>
          USB OTG · Canon PTP · Single-shot JPEG
        </Text>

        <View
          style={[
            styles.connectionPanel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.cameraGlyphWrap, { backgroundColor: colors.accent }]}>
            <Feather name="camera" size={37} color={colors.mutedForeground} />
            <View style={[styles.offlineBadge, { backgroundColor: colors.card }]}>
              <View style={[styles.offlineDot, { backgroundColor: camera.device ? colors.primary : colors.destructive }]} />
            </View>
          </View>
          <Text style={[styles.connectionTitle, { color: colors.foreground }]}>
            {!camera.available ? 'USB needs the Android build' : camera.device ? 'Connected over USB' : camera.busy ? 'Opening USB camera…' : 'Connect your camera by USB'}
          </Text>
          <Text style={[styles.connectionCopy, { color: colors.mutedForeground }]}>
            {!camera.available
              ? 'The USB driver is included in the source. This browser / Expo Go preview cannot load native USB code or take photos.'
              : camera.message}
          </Text>
          {camera.error ? (
            <Text accessibilityRole="alert" style={[styles.connectionCopy, { color: colors.destructive }]}>
              {camera.error}
            </Text>
          ) : null}
          {camera.available ? (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={camera.busy || camera.scanning}
                onPress={() => { if (camera.device) void camera.disconnect(); else void camera.scan(); }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: camera.busy || camera.scanning ? 0.5 : pressed ? 0.8 : 1 },
                ]}
                testID="scan-usb-cameras"
              >
                {camera.scanning || camera.busy ? <ActivityIndicator color={colors.primaryForeground} /> : <Feather name={camera.device ? 'power' : 'refresh-cw'} size={18} color={colors.primaryForeground} />}
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  {camera.device ? 'Disconnect camera' : camera.scanning ? 'Scanning USB…' : 'Scan USB cameras'}
                </Text>
              </Pressable>
              {!camera.device && !camera.scanning && camera.devices.length === 0 ? (
                <Text style={[styles.connectionCopy, { color: colors.mutedForeground, marginTop: 14, marginBottom: 0 }]}>
                  No USB camera detected. Check camera power, OTG adapter and data cable.
                </Text>
              ) : null}
              {!camera.device && camera.devices.map((device) => (
                <Pressable
                  key={device.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Connect ${device.name}`}
                  disabled={!device.supported || camera.busy}
                  onPress={() => void camera.connect(device.id)}
                  style={[styles.usbDevice, { borderColor: colors.border, opacity: device.supported && !camera.busy ? 1 : 0.5 }]}
                  testID={`usb-device-${device.id}`}
                >
                  <Feather name="camera" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>{device.name}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                      {device.supported ? 'Tap to connect · Android permission required' : 'Not supported yet · original EOS 6D only'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={showSetup}
            style={({ pressed }) => [
              styles.setupLink,
              { opacity: pressed ? 0.65 : 1 },
            ]}
            testID="setup-camera"
          >
            <Feather name="help-circle" size={17} color={colors.primary} />
            <Text style={[styles.primaryButtonText, { color: colors.primary }]}>
              USB setup guide
            </Text>
            <Feather name="arrow-up-right" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.captureHeader}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            REMOTE SHUTTER
          </Text>
          <Text style={[styles.captureHint, { color: colors.mutedForeground }]}>
            {camera.state === 'downloading' ? `${camera.progress}% downloaded` : camera.device ? 'USB' : 'Connect first'}
          </Text>
        </View>
        <View style={styles.shutterArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take one photo and download the JPEG"
            accessibilityState={{ disabled: !camera.device || camera.busy }}
            disabled={!camera.device || camera.busy}
            onPress={() => { void Haptics.selectionAsync(); void camera.capture(); }}
            style={[styles.shutterOuter, { borderColor: colors.border }]}
            testID="take-photo"
          >
            <View style={[styles.shutterInner, { backgroundColor: camera.device && !camera.busy ? colors.primary : colors.secondary }]}>
              {camera.state === 'capturing' || camera.state === 'downloading'
                ? <ActivityIndicator color={colors.primary} />
                : <Feather name="aperture" size={31} color={camera.device && !camera.busy ? colors.primaryForeground : colors.mutedForeground} />}
            </View>
          </Pressable>
          <Text style={[styles.shutterLabel, { color: colors.mutedForeground }]}>
            {camera.state === 'capturing' ? 'TAKING PHOTO…' : camera.state === 'downloading' ? `DOWNLOADING ${camera.progress}%` : camera.device ? 'TAKE A PHOTO' : 'SHUTTER UNAVAILABLE'}
          </Text>
        </View>

        <View style={styles.lastCaptureHeader}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            LAST CAPTURE
          </Text>
          <Feather name="image" size={17} color={colors.mutedForeground} />
        </View>
        {camera.lastCapture ? (
          <View style={[styles.savedCapture, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image source={{ uri: camera.lastCapture.uri }} style={styles.captureImage} contentFit="contain" accessibilityLabel="Last JPEG downloaded from the Canon EOS 6D" />
            <Text numberOfLines={1} style={[styles.captureFilename, { color: colors.foreground }]}>{camera.lastCapture.name}</Text>
            <Text style={[styles.captureFileDetail, { color: colors.mutedForeground }]}>
              {(camera.lastCapture.bytes / 1024 / 1024).toFixed(1)} MB · {new Date(camera.lastCapture.createdAt).toLocaleString()} · Saved on device
            </Text>
          </View>
        ) : <View
          style={[
            styles.emptyCapture,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Feather name="image" size={20} color={colors.mutedForeground} />
          <Text style={[styles.emptyCaptureText, { color: colors.mutedForeground }]}>
            No captured images yet. Downloaded JPEGs will appear here.
          </Text>
        </View>}
      </ScrollView>
      <SetupSheet visible={setupVisible} onClose={() => setSetupVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  setupLink: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', paddingHorizontal: 4, marginTop: 10 },
  usbDevice: { width: '100%', flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  savedCapture: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', paddingBottom: 14 },
  captureImage: { width: '100%', height: 215 },
  captureFilename: { fontSize: 12, paddingHorizontal: 14, marginTop: 12 },
  captureFileDetail: { fontSize: 10, paddingHorizontal: 14, marginTop: 6 },
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 110 },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 14, fontWeight: '700', letterSpacing: 2.4 },
  brandSubtitle: { fontSize: 9, fontWeight: '600', letterSpacing: 1.35, marginTop: 3 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.65 },
  statusPill: {
    minHeight: 28,
    borderRadius: 100,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: { width: 6, height: 6, borderRadius: 6 },
  statusPillText: { fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  modelName: { fontSize: 29, fontWeight: '600', letterSpacing: -0.8, marginTop: 13 },
  modelSubline: { fontSize: 13, marginTop: 5 },
  connectionPanel: {
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 20,
    marginTop: 23,
  },
  cameraGlyphWrap: {
    width: 74,
    height: 74,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  offlineBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineDot: { width: 8, height: 8, borderRadius: 4 },
  connectionTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  connectionCopy: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 19,
    maxWidth: 300,
  },
  primaryButton: {
    minHeight: 50,
    width: '100%',
    borderRadius: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'center' },
  captureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 27,
  },
  captureHint: { fontSize: 11 },
  shutterArea: { alignItems: 'center', paddingTop: 14, paddingBottom: 17 },
  shutterOuter: {
    width: 78,
    height: 78,
    borderWidth: 1,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginTop: 9 },
  lastCaptureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 11,
  },
  emptyCapture: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyCaptureText: { fontSize: 12, lineHeight: 17, flex: 1 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 23,
    paddingBottom: 16,
  },
  sheetGrabber: {
    width: 38,
    height: 4,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 22,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitleGroup: { gap: 7 },
  sheetTitle: { fontSize: 23, fontWeight: '600', letterSpacing: -0.5 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDescription: { fontSize: 13, lineHeight: 20, marginTop: 12, maxWidth: 330 },
  steps: { gap: 21, marginTop: 24 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 13 },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  stepCopy: { flex: 1, paddingTop: 1 },
  stepTitle: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  stepBody: { fontSize: 12, lineHeight: 18 },
  protocolNote: {
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    marginTop: 23,
    marginBottom: 17,
  },
  protocolNoteText: { fontSize: 11, lineHeight: 17, flex: 1 },
  platformNotice: { borderRadius: 14, padding: 15, alignItems: 'center' },
  platformNoticeText: { fontSize: 13, textAlign: 'center' },
  dismissButton: { alignItems: 'center', paddingVertical: 15 },
  dismissButtonText: { fontSize: 13, fontWeight: '600' },
});
