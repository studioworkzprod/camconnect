---
name: Android build storage quota
description: Hidden storage quotas during local Android builds and misleading Java crashes.
---

Treat `Disk quota exceeded` / errno `-122` as authoritative even when `df` shows
many gigabytes available. Do not infer a usable quota from filesystem free space.

**Why:** During an Android build, Java crashed in `PerfLongVariant::sample`
with SIGBUS; the next attempt exposed EDQUOT while npm tried to write its cache.
Both temporary and home-directory writes were affected despite ample reported
filesystem space. Removing this build's downloaded installer archives restored
writes. Disabling the optional Java performance-data sampler avoids that crash
path but does not solve the underlying storage limit.

**How to apply:** Before retrying an SDK/Gradle build after these symptoms,
inspect the build's own caches and archives. Remove only disposable files created
for the build, not user assets or signing material. Keep APK outputs ignored.
Do not repeatedly swap Java versions or retry the same failing storage check.
