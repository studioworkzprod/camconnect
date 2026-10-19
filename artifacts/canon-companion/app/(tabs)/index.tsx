import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Linking,
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

function StatusPill() {
  const colors = useColors();
  return (
    <View style={[styles.statusPill, { backgroundColor: colors.accent }]}>
      <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.statusPillText, { color: colors.foreground }]}>
        SETUP REQUIRED
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

  async function openWifiSettings() {
    if (Platform.OS !== 'android') return;
    try {
      await Linking.sendIntent('android.settings.WIFI_SETTINGS');
    } catch {
      await Linking.openSettings();
    }
  }

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
            Put the camera in its wireless remote-control mode, then join the
            camera network from Android.
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
                  Open the EOS 6D Wi-Fi function and choose the EOS Utility /
                  remote-control connection.
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
                  Join the Wi-Fi network shown by the camera. Android may warn
                  that it has no internet access; stay connected.
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.protocolNote, { borderColor: colors.border }]}>
            <Feather name="info" size={17} color={colors.primary} />
            <Text style={[styles.protocolNoteText, { color: colors.mutedForeground }]}>
              Direct 6D control uses Canon’s older EOS remote protocol. This
              preview does not yet connect to or trigger the camera.
            </Text>
          </View>

          {Platform.OS === 'android' ? (
            <Pressable
              accessibilityRole="button"
              onPress={openWifiSettings}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
              ]}
              testID="open-wifi-settings"
            >
              <Feather name="wifi" size={18} color={colors.primaryForeground} />
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                Open Wi-Fi settings
              </Text>
            </Pressable>
          ) : (
            <View style={[styles.platformNotice, { backgroundColor: colors.accent }]}>
              <Text style={[styles.platformNoticeText, { color: colors.mutedForeground }]}>
                Wi-Fi setup is available on your Android device.
              </Text>
            </View>
          )}
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
          <Feather name="more-horizontal" size={23} color={colors.mutedForeground} />
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
          First-generation wireless DSLR
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
              <View style={[styles.offlineDot, { backgroundColor: colors.destructive }]} />
            </View>
          </View>
          <Text style={[styles.connectionTitle, { color: colors.foreground }]}>
            Camera link is not active
          </Text>
          <Text style={[styles.connectionCopy, { color: colors.mutedForeground }]}>
            Pairing instructions are ready. Direct camera control is still being
            built and is not available in this preview.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={showSetup}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
            ]}
            testID="setup-camera"
          >
            <Feather name="settings" size={17} color={colors.primaryForeground} />
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              Camera setup
            </Text>
            <Feather name="arrow-up-right" size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <View style={styles.captureHeader}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            REMOTE SHUTTER
          </Text>
          <Text style={[styles.captureHint, { color: colors.mutedForeground }]}>
            Connect first
          </Text>
        </View>
        <View style={styles.shutterArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take a photo. Unavailable until camera control is connected."
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.shutterOuter, { borderColor: colors.border }]}
            testID="take-photo-disabled"
          >
            <View style={[styles.shutterInner, { backgroundColor: colors.secondary }]}>
              <Feather name="aperture" size={31} color={colors.mutedForeground} />
            </View>
          </Pressable>
          <Text style={[styles.shutterLabel, { color: colors.mutedForeground }]}>
            SHUTTER UNAVAILABLE
          </Text>
        </View>

        <View style={styles.lastCaptureHeader}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            LAST CAPTURE
          </Text>
          <Feather name="image" size={17} color={colors.mutedForeground} />
        </View>
        <View
          style={[
            styles.emptyCapture,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Feather name="image" size={20} color={colors.mutedForeground} />
          <Text style={[styles.emptyCaptureText, { color: colors.mutedForeground }]}>
            Captured images will appear here after the camera link is available.
          </Text>
        </View>
      </ScrollView>
      <SetupSheet visible={setupVisible} onClose={() => setSetupVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 28 },
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
