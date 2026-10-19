import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const releaseFilePath = path.join(process.cwd(), "public", "downloads", "apk", "release.json");
const apkDir = path.join(process.cwd(), "public", "downloads", "apk");

const defaultRelease = {
  appName: "PLN Nusa Daya Mobile (WACB & HAR)",
  packageName: "com.plnnusadaya.logsheet",
  version: "v1.0.0",
  buildNumber: "1",
  fileUrl: "/downloads/apk/pln-nusadaya-mobile-v1.0.0.apk",
  fileName: "pln-nusadaya-mobile-v1.0.0.apk",
  fileSize: "64.3 MB",
  fileSizeBytes: 67461867,
  releaseDate: "19 Oktober 2026",
  minAndroid: "Android 8.0 (Oreo) atau lebih tinggi",
  isActive: true,
  developer: "Tim Developer PT PLN Nusa Daya",
  changelog: [
    "Pencatatan Logsheet Mesin Pembangkit 48-slot secara real-time dan terverifikasi",
    "Monitoring tiket gangguan HAR (Pemeliharaan) dan pelaporan AMC terpadu",
    "Presensi kehadiran berbasis GPS Geofence radius 250 meter lokasi unit kerja",
    "Sinkronisasi data offline otomatis ketika koneksi internet stabil",
  ],
  downloadCount: 142,
};

export async function GET() {
  try {
    if (fs.existsSync(releaseFilePath)) {
      const data = fs.readFileSync(releaseFilePath, "utf8");
      return NextResponse.json({ success: true, data: JSON.parse(data) });
    }
    return NextResponse.json({ success: true, data: defaultRelease });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal membaca data rilis APK" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(apkDir)) {
      fs.mkdirSync(apkDir, { recursive: true });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Upload file APK langsung)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("apkFile") as File | null;
      const appName = (formData.get("appName") as string) || defaultRelease.appName;
      const version = (formData.get("version") as string) || defaultRelease.version;
      const buildNumber = (formData.get("buildNumber") as string) || defaultRelease.buildNumber;
      const minAndroid = (formData.get("minAndroid") as string) || defaultRelease.minAndroid;
      const changelogRaw = (formData.get("changelog") as string) || "";
      const isActive = formData.get("isActive") !== "false";

      let fileUrl = defaultRelease.fileUrl;
      let fileName = defaultRelease.fileName;
      let fileSize = defaultRelease.fileSize;
      let fileSizeBytes = defaultRelease.fileSizeBytes;

      if (file && file.size > 0) {
        fileName = `pln-nusadaya-mobile-${version.replace(/[^a-zA-Z0-9._-]/g, "")}.apk`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(apkDir, fileName);
        fs.writeFileSync(filePath, buffer);

        fileSizeBytes = file.size;
        fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        fileUrl = `/downloads/apk/${fileName}`;
      }

      const changelog = changelogRaw
        ? changelogRaw.split("\n").map((line) => line.trim()).filter(Boolean)
        : defaultRelease.changelog;

      const updatedRelease = {
        appName,
        packageName: defaultRelease.packageName,
        version,
        buildNumber,
        fileUrl,
        fileName,
        fileSize,
        fileSizeBytes,
        releaseDate: new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date()),
        minAndroid,
        isActive,
        developer: "Tim Developer PT PLN Nusa Daya",
        changelog,
        downloadCount: defaultRelease.downloadCount,
      };

      fs.writeFileSync(releaseFilePath, JSON.stringify(updatedRelease, null, 2), "utf8");
      return NextResponse.json({ success: true, message: "APK dan metadata berhasil diperbarui", data: updatedRelease });
    }

    // 2. JSON Body (Update metadata atau link eksternal)
    const body = await req.json();
    let currentData = defaultRelease;
    if (fs.existsSync(releaseFilePath)) {
      try {
        currentData = JSON.parse(fs.readFileSync(releaseFilePath, "utf8"));
      } catch {}
    }

    const updatedRelease = {
      ...currentData,
      ...body,
      releaseDate: body.releaseDate || new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date()),
    };

    fs.writeFileSync(releaseFilePath, JSON.stringify(updatedRelease, null, 2), "utf8");
    return NextResponse.json({ success: true, message: "Metadata rilis APK berhasil disimpan", data: updatedRelease });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui rilis APK" },
      { status: 500 }
    );
  }
}
