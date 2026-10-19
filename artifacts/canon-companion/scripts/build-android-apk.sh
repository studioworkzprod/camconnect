#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
if [ -z "${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}" ]; then
  echo "Set ANDROID_SDK_ROOT to an installed Android SDK." >&2
  exit 1
fi
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export NODE_ENV=production
export CI=1
# A storage quota can truncate HotSpot's shared perf buffer and crash its watcher.
# Disable the optional sampler so storage failures remain actionable build errors.
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:+$JAVA_TOOL_OPTIONS }-XX:-UsePerfData"

# Regenerate from maintained sources, including the Canon USB config plugin.
pnpm exec expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleRelease \
  --no-daemon --max-workers=2 \
  "-PreactNativeArchitectures=${ANDROID_ABIS:-arm64-v8a,armeabi-v7a}" \
  -Dorg.gradle.jvmargs="-Xmx4096m -XX:MaxMetaspaceSize=1024m" \
  "$@"

# The Expo template signs this test release with its development key. It embeds
# JavaScript/Hermes assets and does not require Metro. This is not store signing.
OUTPUT="../../../generated-artifacts/apk"
mkdir -p "$OUTPUT"
cp app/build/outputs/apk/release/app-release.apk "$OUTPUT/canon-companion-usb-test.apk"
echo "Created generated-artifacts/apk/canon-companion-usb-test.apk (test signing)."
