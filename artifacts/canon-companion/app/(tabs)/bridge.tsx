import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useUsbCamera } from '@/contexts/UsbCameraContext';

const flow = [
  {
    number: '01',
    title: 'PWA requests a capture',
    detail: 'Your browser tool asks the companion to take a shot.',
    icon: 'send' as const,
  },
  {
    number: '02',
    title: 'Android triggers the EOS 6D',
    detail: 'The phone sends the shutter command over its USB OTG connection.',
    icon: 'camera' as const,
  },
  {
    number: '03',
    title: 'Image returns to your PWA',
    detail: 'The companion transfers the captured file for your processing flow.',
    icon: 'image' as const,
  },
];

export default function BridgeScreen() {
  const colors = useColors();
  const camera = useUsbCamera();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 18 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View style={[styles.brandMark, { backgroundColor: colors.accent }]}>
            <Feather name="share-2" size={20} color={colors.primary} />
          </View>
          <View style={styles.headingCopy}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              LOCAL INTEGRATION
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              PWA bridge
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPanel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statusLine}>
            <View style={[styles.statusIcon, { backgroundColor: colors.accent }]}>
              <Feather name="radio" size={20} color={colors.mutedForeground} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                Bridge is not running
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.mutedForeground }]}>
                {camera.device ? 'USB camera connected. PWA service is not implemented yet.' : 'Connect the camera by USB. PWA service is not implemented yet.'}
              </Text>
            </View>
            <View style={[styles.inactiveBadge, { backgroundColor: colors.secondary }]}>
              <View style={[styles.inactiveDot, { backgroundColor: colors.mutedForeground }]} />
              <Text style={[styles.inactiveText, { color: colors.mutedForeground }]}>
                OFF
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.endpointRow}>
            <Feather name="link-2" size={16} color={colors.mutedForeground} />
            <Text style={[styles.endpointLabel, { color: colors.mutedForeground }]}>
              Device endpoint
            </Text>
            <Text style={[styles.endpointValue, { color: colors.mutedForeground }]}>
              Not available
            </Text>
          </View>
        </View>

        <View style={styles.flowHeading}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            PLANNED WORKFLOW
          </Text>
        </View>
        <View style={styles.flowList}>
          {flow.map((item, index) => (
            <View key={item.number} style={styles.flowItem}>
              <View style={styles.flowRail}>
                <View
                  style={[
                    styles.flowIcon,
                    { backgroundColor: colors.accent, borderColor: colors.border },
                  ]}
                >
                  <Feather name={item.icon} size={17} color={colors.primary} />
                </View>
                {index < flow.length - 1 ? (
                  <View style={[styles.flowConnector, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
              <View style={styles.flowCopy}>
                <Text style={[styles.flowTitle, { color: colors.foreground }]}>
                  {item.title}
                </Text>
                <Text style={[styles.flowDetail, { color: colors.mutedForeground }]}>
                  {item.detail}
                </Text>
              </View>
              <Text style={[styles.flowNumber, { color: colors.mutedForeground }]}>
                {item.number}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.roadmapPanel, { backgroundColor: colors.accent }]}>
          <Feather name="tool" size={17} color={colors.primary} />
          <View style={styles.roadmapCopy}>
            <Text style={[styles.roadmapTitle, { color: colors.foreground }]}>
              USB driver added · PWA bridge still pending
            </Text>
            <Text style={[styles.roadmapDetail, { color: colors.mutedForeground }]}>
              The Android USB driver can request camera access, trigger a
              single shot and download the JPEG. It still needs physical
              hardware validation. No PWA endpoint or capture requests are
              exposed in this build.
            </Text>
          </View>
        </View>

        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          The bridge is intended for apps on the same local network. Your images
          should travel from camera to phone over USB, then to your PWA without
          an automatic cloud upload.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 110 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 26 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: { gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.55 },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -0.7 },
  statusPanel: { borderWidth: 1, borderRadius: 18, padding: 16 },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 14, fontWeight: '600' },
  statusSubtitle: { fontSize: 11, marginTop: 4 },
  inactiveBadge: {
    borderRadius: 50,
    minHeight: 26,
    paddingHorizontal: 9,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  inactiveDot: { width: 5, height: 5, borderRadius: 3 },
  inactiveText: { fontSize: 9, letterSpacing: 0.8, fontWeight: '700' },
  divider: { height: 1, marginVertical: 15 },
  endpointRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  endpointLabel: { fontSize: 11, flex: 1 },
  endpointValue: { fontSize: 11, fontWeight: '600' },
  flowHeading: { marginTop: 31, marginBottom: 17 },
  flowList: { gap: 0 },
  flowItem: { minHeight: 82, flexDirection: 'row', alignItems: 'flex-start', gap: 13 },
  flowRail: { alignItems: 'center', width: 38, height: '100%' },
  flowIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowConnector: { width: 1, flex: 1, marginTop: 5, minHeight: 24 },
  flowCopy: { flex: 1, paddingTop: 3 },
  flowTitle: { fontSize: 13, fontWeight: '600' },
  flowDetail: { fontSize: 11, lineHeight: 17, marginTop: 5, maxWidth: 260 },
  flowNumber: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, paddingTop: 5 },
  roadmapPanel: {
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginTop: 18,
  },
  roadmapCopy: { flex: 1 },
  roadmapTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  roadmapDetail: { fontSize: 11, lineHeight: 17 },
  footerNote: { fontSize: 11, lineHeight: 17, marginTop: 18, paddingHorizontal: 2 },
});
