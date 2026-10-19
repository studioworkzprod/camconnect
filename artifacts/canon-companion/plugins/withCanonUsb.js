const { withAndroidManifest, withMainApplication, withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

/** Copy the maintained Java sources on each prebuild; never edit generated Android sources. */
module.exports = function withCanonUsb(config) {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    const features = manifest['uses-feature'] || [];
    if (!features.some((feature) => feature.$['android:name'] === 'android.hardware.usb.host')) {
      features.push({ $: { 'android:name': 'android.hardware.usb.host', 'android:required': 'true' } });
    }
    manifest['uses-feature'] = features;
    // USB access uses UsbManager's per-device consent, not a blanket manifest permission.
    return mod;
  });
  config = withMainApplication(config, (mod) => {
    if (mod.modResults.language !== 'kt') throw new Error('Canon USB plugin expects the Expo Kotlin MainApplication template.');
    let source = mod.modResults.contents;
    if (!source.includes('import com.fieldlink.usb.CanonUsbPackage')) {
      source = source.replace(/(package [^\n]+\n)/, '$1\nimport com.fieldlink.usb.CanonUsbPackage\n');
    }
    if (!source.includes('add(CanonUsbPackage())')) {
      const anchor = /PackageList\(this\)\.packages\.apply\s*\{/;
      if (!anchor.test(source)) throw new Error('Cannot register CanonUsbPackage: unknown MainApplication template.');
      source = source.replace(anchor, '$&\n              add(CanonUsbPackage())');
    }
    mod.modResults.contents = source;
    return mod;
  });
  return withDangerousMod(config, ['android', async (mod) => {
    const source = path.join(mod.modRequest.projectRoot, 'native/android/com/fieldlink/usb');
    const target = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/java/com/fieldlink/usb');
    await fs.mkdir(target, { recursive: true });
    for (const name of await fs.readdir(source)) {
      if (name.endsWith('.java')) await fs.copyFile(path.join(source, name), path.join(target, name));
    }
    return mod;
  }]);
};
