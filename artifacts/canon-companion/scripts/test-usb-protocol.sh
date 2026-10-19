#!/bin/sh
set -eu
TEMP_CLASSES="$(mktemp -d)"
trap 'rm -rf "$TEMP_CLASSES"' EXIT
javac -d "$TEMP_CLASSES" \
  native/android/com/fieldlink/usb/PtpSession.java \
  native/android/com/fieldlink/usb/Canon6dDriver.java \
  tests/native/PtpSessionTest.java
java -cp "$TEMP_CLASSES" com.fieldlink.usb.PtpSessionTest
