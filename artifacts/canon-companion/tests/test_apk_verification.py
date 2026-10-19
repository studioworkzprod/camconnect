"""Small packaging regression checks; not a substitute for real APK/hardware tests."""

import importlib.util
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location(
    "apk_verifier", Path(__file__).parents[1] / "scripts/verify-android-apk.py"
)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)

BADGING = """package: name='com.fieldlink.canoncompanion' versionCode='1'
uses-feature: name='android.hardware.usb.host'
launchable-activity: name='com.fieldlink.canoncompanion.MainActivity'
"""
ABIS = ["arm64-v8a", "armeabi-v7a"]


class ApkVerificationTest(unittest.TestCase):
    def make_apk(self, folder, omit=None):
        entries = {
            "assets/index.android.bundle": b"bundled application",
            "lib/arm64-v8a/libreactnative.so": b"test library",
            "lib/armeabi-v7a/libreactnative.so": b"test library",
            "classes.dex": b"Lcom/fieldlink/usb/CanonUsbModule;Lcom/fieldlink/usb/CanonUsbPackage;",
            "classes2.dex": b"Lcom/fieldlink/usb/Canon6dDriver;Lcom/fieldlink/usb/PtpSession;",
        }
        apk = Path(folder) / "test.apk"
        with zipfile.ZipFile(apk, "w") as archive:
            for name, data in entries.items():
                if name != omit:
                    archive.writestr(name, data)
        return apk

    def test_accept_complete_packaging(self):
        with tempfile.TemporaryDirectory() as folder:
            verifier.validate_contents(self.make_apk(folder), BADGING, ABIS)

    def test_reject_missing_bundle_driver_and_abi(self):
        for omitted in (
            "assets/index.android.bundle", "classes.dex", "classes2.dex",
            "lib/arm64-v8a/libreactnative.so", "lib/armeabi-v7a/libreactnative.so",
        ):
            with self.subTest(omitted=omitted), tempfile.TemporaryDirectory() as folder:
                with self.assertRaises(ValueError):
                    verifier.validate_contents(self.make_apk(folder, omitted), BADGING, ABIS)

    def test_reject_incorrect_manifest(self):
        for badging in (
            BADGING.replace("com.fieldlink.canoncompanion", "another.app"),
            BADGING.replace("uses-feature:", "uses-feature-not-required:"),
            BADGING + "application-debuggable\n",
            BADGING.replace("launchable-activity:", "another-activity:"),
        ):
            with self.subTest(badging=badging), tempfile.TemporaryDirectory() as folder:
                with self.assertRaises(ValueError):
                    verifier.validate_contents(self.make_apk(folder), badging, ABIS)

    def test_reject_empty_bundle(self):
        with tempfile.TemporaryDirectory() as folder:
            apk = Path(folder) / "empty.apk"
            with zipfile.ZipFile(apk, "w") as archive:
                archive.writestr("assets/index.android.bundle", b"")
            with self.assertRaisesRegex(ValueError, "empty JavaScript"):
                verifier.validate_contents(apk, BADGING, ABIS)


if __name__ == "__main__":
    unittest.main()
