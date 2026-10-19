# Installing the USB test APK

This APK is for testing the experimental Canon EOS 6D USB driver. A successful
build does not establish compatibility with your phone and camera.

**Build status:** No APK has been produced yet; local packaging was blocked by a
storage quota. These instructions apply once the test APK has been built.

## Installation

1. Download `canon-companion-usb-test.apk` onto your Android phone or tablet.
2. Open the file. If Android requests it, allow **Install unknown apps** for the
   browser or file manager you used. You can turn that permission off afterward.
3. Install and open **Canon DSLR Companion**. Do not scan an Expo Go QR code:
   this APK includes its own app code and native USB module.
4. Keep normal Android security protections enabled. If Android reports that
   the APK is invalid or incompatible, stop and report the exact message.

The APK uses the standard development signing key for sideload testing, not
private production/store signing. It is not a Play Store release. A differently
signed existing installation cannot be updated in place. Do not uninstall an
existing copy without first preserving any captured images you need: uninstalling
removes app-private captures.

## First USB test

1. Use a USB-host/OTG-capable Android device and a data-capable USB cable with a
   Mini-USB camera connector. Use an OTG adapter if your phone requires one.
2. On the original EOS 6D, turn Wi-Fi off, insert a writable SD card, select JPEG
   or RAW+JPEG and single-shot drive. Do not use Bulb mode.
3. Turn the camera on, connect the cable, and keep the companion in the foreground.
4. Tap **Scan USB cameras**, select the EOS 6D, then allow Android's USB access
   prompt. Wait until the app reports the real USB connection.
5. Tap the shutter once. Wait for the JPEG download and preview to finish.
6. Check that the original photo also remains on the camera's card.

If a capture or download fails, check the camera card before trying again: the
camera may have taken a photo even though the transfer failed. The app does not
automatically retry a shutter command or delete camera files.

Only the original Canon EOS 6D is supported by this experimental adapter. The
PWA trigger/image-return bridge is not implemented in this APK.
