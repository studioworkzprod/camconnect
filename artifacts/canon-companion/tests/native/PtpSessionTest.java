package com.fieldlink.usb;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Deterministic fake wire tests. These are NOT camera compatibility tests. */
public final class PtpSessionTest {
  private static int passed;
  private interface Checked { void run() throws Exception; }
  private static void test(String name, Checked body) throws Exception {
    body.run(); passed++; System.out.println("PASS " + name);
  }
  private static void check(boolean condition, String why) {
    if (!condition) throw new AssertionError(why);
  }
  private static void fails(Checked body, String expected) throws Exception {
    try { body.run(); throw new AssertionError("Expected failure: " + expected); }
    catch (IOException e) { check(e.getMessage().contains(expected), "Unexpected failure: " + e.getMessage()); }
  }
  static final class Camera implements PtpSession.Transport {
    final ArrayDeque<Byte> incoming = new ArrayDeque<>();
    final List<Integer> operations = new ArrayList<>();
    boolean photo, closed, failShutter, badTx, partialWrite, oversized, duplicate;
    boolean malformedDevice, rawAndJpeg, truncatedImage, oversizedImage;
    int destination = 4, shots, halfReleases, fullReleases, downloads;
    String model = "Canon EOS 6D";
    final byte[] jpeg = {(byte) 0xff, (byte) 0xd8, (byte) 0xff, (byte) 0xd9};
    @Override public int read(byte[] target, int timeout) {
      if (closed || incoming.isEmpty()) return -1;
      int count = Math.min(5, Math.min(target.length, incoming.size())); // Arbitrarily fragmented headers/data.
      for (int i = 0; i < count; i++) target[i] = incoming.removeFirst();
      return count;
    }
    void enqueue(byte[] bytes) { for (byte b : bytes) incoming.addLast(b); }
    void packet(int type, int code, int tx, byte[] data) {
      ByteBuffer packet = PtpSession.le(new byte[12 + data.length]);
      packet.putInt(packet.capacity()).putShort((short) type).putShort((short) code).putInt(badTx ? tx + 1 : tx).put(data);
      enqueue(packet.array());
    }
    void respond(int opcode, int tx, byte[] data, int code) {
      if (data != null) packet(2, opcode, tx, data);
      packet(3, code, tx, new byte[0]);
    }
    @Override public int write(byte[] bytes, int offset, int length, int timeout) throws IOException {
      if (partialWrite) return length - 1;
      ByteBuffer b = PtpSession.le(Arrays.copyOfRange(bytes, offset, offset + length));
      int size = b.getInt(), type = Short.toUnsignedInt(b.getShort()), opcode = Short.toUnsignedInt(b.getShort()), tx = b.getInt();
      check(size == length, "Expected complete small command");
      if (type == 2 && opcode == 0x9110) {
        check(b.getInt() == 12 && b.getInt() == 0xD11C, "Capture destination property payload");
        destination = b.getInt(); respond(opcode, tx, null, 0x2001); return length;
      }
      operations.add(opcode);
      if (oversized) {
        ByteBuffer header = PtpSession.le(new byte[12]);
        header.putInt(8 * 1024 * 1024).putShort((short) 2).putShort((short) opcode).putInt(tx);
        enqueue(header.array()); return length;
      }
      if (opcode == 0x9110) return length; // Data-out transaction completes after its data container.
      if (opcode == 0x1001) {
        respond(opcode, tx, malformedDevice ? new byte[0] : deviceInfo(model), 0x2001);
      } else if (opcode == 0x9116) {
        respond(opcode, tx, PtpSession.words(16, 0xC189, 0xD11C, destination, 8, 0), 0x2001);
      } else if (opcode == 0x1004) {
        respond(opcode, tx, PtpSession.words(1, 0x00010001), 0x2001);
      } else if (opcode == 0x1007) {
        check(b.getInt() == -1 && b.getInt() == 0 && b.getInt() == 0, "Enumerate without unsupported format filters");
        respond(opcode, tx, !photo ? PtpSession.words(0) : duplicate || rawAndJpeg ? PtpSession.words(2, 7, 8) : PtpSession.words(1, 7), 0x2001);
      } else if (opcode == 0x9128) {
        int button = b.getInt();
        if (button == 2) {
          shots++;
          if (failShutter) { respond(opcode, tx, null, 0x2019); return length; }
          photo = true;
        }
        respond(opcode, tx, null, 0x2001);
      } else if (opcode == 0x9129) {
        int button = b.getInt();
        if (button == 1) halfReleases++; else fullReleases++;
        respond(opcode, tx, null, 0x2001);
      } else if (opcode == 0x1008) {
        int handle = b.getInt();
        ByteBuffer info = PtpSession.le(new byte[52]);
        info.putShort(4, (short) (rawAndJpeg && handle == 8 ? 0xB101 : 0x3801));
        info.putInt(8, oversizedImage ? 256 * 1024 * 1024 : jpeg.length);
        respond(opcode, tx, info.array(), 0x2001);
      } else if (opcode == 0x1009) {
        downloads++;
        if (truncatedImage) {
          ByteBuffer header = PtpSession.le(new byte[12]);
          header.putInt(12 + jpeg.length).putShort((short) 2).putShort((short) opcode).putInt(tx);
          enqueue(header.array()); enqueue(new byte[]{(byte) 0xff});
        } else respond(opcode, tx, jpeg, 0x2001);
      } else respond(opcode, tx, null, 0x2001);
      return length;
    }
    @Override public void close() { closed = true; }
  }
  static byte[] text(String value) {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    out.write(value.length() + 1);
    out.writeBytes(value.getBytes(StandardCharsets.UTF_16LE));
    out.writeBytes(new byte[2]);
    return out.toByteArray();
  }
  static byte[] deviceInfo(String model) {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    out.writeBytes(new byte[8]); out.write(0); out.writeBytes(new byte[2]);
    int[] operations = {0x1004, 0x1007, 0x1008, 0x1009, 0x9110, 0x9114, 0x9115, 0x9116, 0x9128, 0x9129};
    out.writeBytes(PtpSession.words(operations.length));
    for (int op : operations) out.writeBytes(new byte[]{(byte) op, (byte) (op >> 8)});
    out.writeBytes(new byte[16]); // Empty events, properties, capture formats, image formats.
    out.writeBytes(text("Canon")); out.writeBytes(text(model));
    return out.toByteArray();
  }
  static File directory() throws IOException { return Files.createTempDirectory("canon-usb-test-").toFile(); }
  static void clean(File dir) {
    File[] files = dir.listFiles();
    if (files != null) for (File f : files) f.delete();
    dir.delete();
  }

  public static void main(String[] args) throws Exception {
    test("fragmented USB data and PTP device identity parsing", () -> {
      Camera fake = new Camera();
      Canon6dDriver.DeviceInfo info = Canon6dDriver.parseDeviceInfo(new PtpSession(fake).command(0x1001));
      check(info.model.equals("Canon EOS 6D") && info.operations.contains(0x9128), "Device info");
    });
    test("reject a mismatched transaction ID", () -> {
      Camera fake = new Camera(); fake.badTx = true;
      fails(() -> new PtpSession(fake).command(0x1001), "transaction ID");
    });
    test("reject oversized metadata before allocating it", () -> {
      Camera fake = new Camera(); fake.oversized = true;
      fails(() -> new PtpSession(fake).command(0x1001), "oversized");
    });
    test("partial command writes fail without retry", () -> {
      Camera fake = new Camera(); fake.partialWrite = true;
      fails(() -> new PtpSession(fake).command(0x9128, 2, 0), "incomplete");
      check(fake.shots == 0, "No repeated shutter");
    });
    test("reject truncated device datasets and malformed events", () -> {
      fails(() -> Canon6dDriver.parseDeviceInfo(new byte[3]), "Truncated");
      fails(() -> Canon6dDriver.captureDestination(PtpSession.words(4096, 0xC189)), "Malformed");
      check(Canon6dDriver.captureDestination(PtpSession.words(8, 0)) == null, "Terminator");
    });
    test("one capture, streamed local JPEG, original card destination restored, no deletion", () -> {
      Camera fake = new Camera(); File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect();
        check(fake.destination == 1, "Save to camera card");
        List<Long> progress = new ArrayList<>();
        File image = camera.capture((current, total) -> progress.add(current));
        check(image.isFile() && image.getName().endsWith(".jpg"), "Saved JPEG");
        check(Arrays.equals(Files.readAllBytes(image.toPath()), fake.jpeg), "Transfer integrity");
        check(progress.get(progress.size() - 1) == fake.jpeg.length, "Download completed");
        check(fake.shots == 1 && fake.downloads == 1, "Exactly one capture");
        check(fake.halfReleases == 1 && fake.fullReleases == 1, "Both shutter presses released");
        check(!fake.operations.contains(0x100B), "Never delete an object");
        camera.close();
        check(fake.destination == 4 && fake.closed, "Restore destination and close USB");
      } finally { camera.close(); clean(dir); }
    });
    test("rejected shutter is not retried, and both presses are released", () -> {
      Camera fake = new Camera(); fake.failShutter = true; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect();
        fails(() -> camera.capture(null), "0x2019");
        check(fake.shots == 1 && fake.downloads == 0, "Never retry uncertain shutter");
        check(fake.halfReleases == 1 && fake.fullReleases == 1, "Release on failure");
      } finally { camera.close(); clean(dir); }
    });
    test("unsupported model fails before remote mode or shutter commands", () -> {
      Camera fake = new Camera(); fake.model = "Canon EOS 6D Mark II"; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        fails(camera::connect, "Only the original");
        check(!fake.operations.contains(0x9114) && fake.shots == 0, "Capability gate");
      } finally { camera.close(); clean(dir); }
    });
    test("ambiguous burst results never return the wrong image", () -> {
      Camera fake = new Camera(); fake.duplicate = true; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect(); fails(() -> camera.capture(null), "Multiple new JPEGs");
        check(fake.downloads == 0 && dir.listFiles().length == 0, "No ambiguous download");
      } finally { camera.close(); clean(dir); }
    });
    test("RAW+JPEG downloads only the new JPEG", () -> {
      Camera fake = new Camera(); fake.rawAndJpeg = true; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect(); File image = camera.capture(null);
        check(image.length() == fake.jpeg.length && fake.downloads == 1, "One JPEG, RAW left on card");
      } finally { camera.close(); clean(dir); }
    });
    test("unplug during image transfer removes the partial local file", () -> {
      Camera fake = new Camera(); fake.truncatedImage = true; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect(); fails(() -> camera.capture(null), "USB read failed");
        check(dir.listFiles().length == 0, "No corrupted local capture");
      } finally { camera.cancel(); camera.close(); clean(dir); }
    });
    test("oversized JPEG is rejected before download", () -> {
      Camera fake = new Camera(); fake.oversizedImage = true; File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect(); fails(() -> camera.capture(null), "supported JPEG size");
        check(fake.downloads == 0, "No oversized allocation or download");
      } finally { camera.close(); clean(dir); }
    });
    test("cancelled camera does not send shutter commands", () -> {
      Camera fake = new Camera(); File dir = directory();
      Canon6dDriver camera = new Canon6dDriver(new PtpSession(fake), dir);
      try {
        camera.connect(); camera.cancel();
        fails(() -> camera.capture(null), "cancelled");
        check(fake.shots == 0, "No shot after cancellation");
      } finally { camera.close(); clean(dir); }
    });
    System.out.println(passed + " USB protocol/driver checks passed. Physical EOS 6D validation is still required.");
  }
}
