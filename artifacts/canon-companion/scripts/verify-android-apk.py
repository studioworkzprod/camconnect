"""Check the actual built APK before CI offers it for download (stdlib only)."""

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import zipfile


def validate_contents(apk, badging, expected_abis):
    if "package: name='com.fieldlink.canoncompanion'" not in badging:
        raise ValueError("APK has the wrong application ID")
    if "uses-feature: name='android.hardware.usb.host'" not in badging:
        raise ValueError("APK does not require Android USB host support")
    if "application-debuggable" in badging:
        raise ValueError("Expected a bundled release variant, not a debuggable APK")
    if "launchable-activity:" not in badging:
        raise ValueError("APK has no launcher activity")
    with zipfile.ZipFile(apk) as archive:
        names = archive.namelist()
        if "assets/index.android.bundle" not in names:
            raise ValueError("APK is missing its offline JavaScript bundle")
        if not archive.getinfo("assets/index.android.bundle").file_size:
            raise ValueError("APK contains an empty JavaScript bundle")
        for abi in expected_abis:
            if not any(n.startswith(f"lib/{abi}/") for n in names):
                raise ValueError(f"APK is missing native libraries for {abi}")
        dex_files = [n for n in names if n.startswith("classes") and n.endswith(".dex")]
        missing = {
            f"Lcom/fieldlink/usb/{name};".encode()
            for name in ("CanonUsbModule", "CanonUsbPackage", "Canon6dDriver", "PtpSession")
        }
        for dex in dex_files:
            contents = archive.read(dex)
            missing = {name for name in missing if name not in contents}
        if missing:
            raise ValueError("APK is missing compiled Canon USB driver classes")


def main():
    root = Path(__file__).resolve().parents[3]
    output = root / "generated-artifacts/apk"
    apk = output / "canon-companion-usb-test.apk"
    sdk = os.environ.get("ANDROID_SDK_ROOT") or os.environ.get("ANDROID_HOME")
    if not sdk:
        raise ValueError("ANDROID_SDK_ROOT / ANDROID_HOME is required")
    tools = Path(sdk) / "build-tools/36.0.0"
    # A valid ZIP alone is not an installable APK. Let Android's official tools
    # verify the signature and decode the binary AndroidManifest.
    signed = subprocess.run(
        [str(tools / "apksigner"), "verify", "--verbose", "--print-certs", str(apk)],
        check=True, text=True, capture_output=True,
    )
    badging = subprocess.check_output(
        [str(tools / "aapt2"), "dump", "badging", str(apk)], text=True
    )
    abis = os.environ.get("ANDROID_ABIS", "arm64-v8a,armeabi-v7a").split(",")
    validate_contents(apk, badging, abis)
    with apk.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    (output / f"{apk.name}.sha256").write_text(f"{digest}  {apk.name}\n")
    (output / "build-info.txt").write_text(
        f"Source commit: {os.environ.get('GITHUB_SHA', 'local build')}\n"
        f"Native architectures: {', '.join(abis)}\n"
        "Signing: development test key, NOT production/store signing\n"
        "Physical camera validation: NOT performed by this build\n"
        "PWA bridge: NOT implemented\n\n"
        + signed.stdout + "\n" + badging
    )
    shutil.copyfile(
        root / "artifacts/canon-companion/native/INSTALL-APK.md",
        output / "INSTALL-APK.md",
    )
    print(f"Verified {apk.name}: signature, USB host, driver classes, bundle, ABIs.")
    print(f"SHA-256: {digest}")


if __name__ == "__main__":
    main()
