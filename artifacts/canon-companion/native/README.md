# Canon EOS 6D USB support

## What is implemented

- Android USB host discovery; original EOS 6D only (Canon `04a9:3250`).
- Android per-device USB permission with denial, timeout and unplug handling.
- Bulk-endpoint PTP session, real device-info and supported-operation checks.
- Canon EOS remote/event initialization and single-shutter release.
- Card-based capture, new JPEG detection and bounded streaming to app-private
  `files/canon-captures/`. The latest saved image is reloaded on app startup.
- Serialized commands, duplicate-tap protection, download progress, foreground
  lifecycle cleanup, and restoration of the original capture destination on a
  normal disconnect. No deletion or modification of existing photos.

This is an **experimental driver**, not a hardware-certified implementation.
Protocol tests use deterministic fake USB responses; a physical Android + EOS 6D
round trip has not been performed. No APK has been built in this workspace.

## Camera/device setup

1. Use a USB-host/OTG-capable Android phone or tablet, an OTG adapter as needed,
   and a USB **data** cable with a Mini-USB connector for the original EOS 6D.
2. Disable Wi-Fi on the 6D (its USB functions are unavailable with Wi-Fi enabled).
3. Insert a writable SD card. Select JPEG or RAW+JPEG, single-shot drive, and a
   normal photo mode, not Bulb. Use a focusable subject, or manual focus.
4. Close other camera-control apps. Keep this companion in the foreground.
5. Scan USB cameras, select the 6D, and accept Android's USB access dialog.
6. Once the real USB handshake completes, tap the shutter. Wait for download to
   finish before unplugging. Original photos remain on the camera SD card.

On capture errors, inspect the card before retrying: a command or download can
fail **after** the camera has already taken a shot. The app never automatically
retries a shutter command. RAW-only transfer, bulb, bursts, live view, exposure
editing, background shooting, and other models are not implemented.

## Native Android build

Expo Go and the browser preview do not contain this custom USB module. They show
an explicit unavailable state, never a simulated camera connection.

Use a machine with Node/pnpm, Android Studio, the Android SDK and the JDK required
by the installed Expo/React Native version:

```sh
pnpm install
cd artifacts/canon-companion
pnpm exec expo prebuild --platform android --no-install
```

Open the generated `android/` project in Android Studio, let Gradle sync, and
build/install on a physical Android device. For development, the installed app
needs a reachable Metro server; for untethered field use, create a release build
with bundled JS. Release signing belongs in local secure Android tooling, never
in committed source. This is not an Expo Go QR-code installation flow.

The static `app.json` registers `plugins/withCanonUsb.js`. Prebuild adds the USB
host feature, copies the maintained Java sources into the generated project, and
registers `CanonUsbPackage`. Do not edit generated Java copies in `android/`.
No native dependency is added to Expo Go and no camera image is cloud-uploaded.

## Verification

With a JDK on PATH, from the mobile package:

```sh
pnpm run test:usb:protocol
pnpm run typecheck
```

Before relying on it, validate a physical connection, permission rejection and
retry, a successful JPEG capture and checksum, RAW+JPEG, full/read-only/missing
SD card, busy/autofocus failure, unplug during permission and transfer,
backgrounding, process relaunch, and repeated single captures. Verify that
normal disconnect restores capture destination and does not delete card files.

### Protocol references

- PTP USB containers use little-endian length/type/code/transaction headers.
- Canon EOS operation IDs and card destination semantics were checked against
  the public `gphoto/libgphoto2` PTP definitions and capture sequence. The code
  here is an independent, deliberately narrow implementation, not a bundled
  copy of libgphoto2.
- Remote-release-on/off: `0x9128` / `0x9129`; EOS events: `0x9116`;
  capture destination: property `0xD11C`, card value `1`.
- gPhoto's compatibility list includes EOS 6D USB remote capture:
  http://www.gphoto.org/doc/remote/

## PWA integration

PWA trigger/image-return services are still unimplemented. The existing Bridge
tab says so explicitly. A future bridge must authenticate callers and account
for browser HTTPS/local-network restrictions; it must not expose an unauthenticated
camera endpoint or assume plain HTTP LAN requests work from hosted HTTPS PWAs.
