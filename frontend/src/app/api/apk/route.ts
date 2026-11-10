import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const releaseFilePath = path.join(process.cwd(), "public", "downloads", "apk", "release.json");
const apkDir = path.join(process.cwd(), "public", "downloads", "apk");

const defaultRelease = {
  appName: "PLN Services Mobile (WACB & HAR)",
  packageName: "com.plnnusadaya.logsheet",
  version: "v1.0.0",
  buildNumber: "1",
  fileUrl: "/downloads/apk/pln-logsheet-mobile-v1.0.0.apk",
  downloadApiUrl: "/api/apk/download?type=logsheet",
  fileName: "pln-logsheet-mobile-v1.0.0.apk",
  fileSize: "64.3 MB",
  fileSizeBytes: 67461867,
  releaseDate: "19 Oktober 2026",
  minAndroid: "Android 8.0 (Oreo) atau lebih tinggi",
  isActive: true,
  developer: "Tim Developer PT PLN Services",
  changelog: [
    "Pencatatan Logsheet Mesin Pembangkit 48-slot secara real-time dan terverifikasi",
    "Monitoring tiket gangguan HAR (Pemeliharaan) dan pelaporan AMC terpadu",
    "Presensi kehadiran berbasis GPS Geofence radius 250 meter lokasi unit kerja",
    "Sinkronisasi data offline otomatis ketika koneksi internet stabil",
  ],
  downloadCount: 286,
  apkList: [
    {
      id: "logsheet",
      targetRole: "OPERATOR MESIN & OPERASIONAL KIT",
      roleBadge: "Khusus Operator PLTD",
      appName: "PLN Logsheet & Operasional PLTD (WACB Mobile)",
      badgeColor: "#0284c7",
      badgeBg: "#e0f2fe",
      themeGradient: "linear-gradient(135deg, #0284c7, #004581)",
      shortDesc: "Aplikasi khusus Operator Mesin Pembangkit untuk pencatatan logsheet beban per jam (48 slot), monitoring parameter mesin, dan presensi GPS geofence di lokasi unit PLTD.",
      version: "v1.0.0",
      fileSize: "64.3 MB",
      fileSizeBytes: 67461867,
      fileName: "pln-logsheet-mobile-v1.0.0.apk",
      fileUrl: "/downloads/apk/pln-logsheet-mobile-v1.0.0.apk",
      downloadApiUrl: "/api/apk/download?type=logsheet",
      minAndroid: "Android 8.0 (Oreo)+",
      releaseDate: "19 Oktober 2026",
      features: [
        "Pencatatan Logsheet Mesin 48-Slot (Beban kW, Tegangan, Suhu, Hz)",
        "Presensi GPS Geofence radius 250m lokasi unit PLTD",
        "Penyimpanan & Sinkronisasi Offline Otomatis",
        "Pengawasan Jam Operasi & Parameter Kritis Mesin"
      ]
    },
    {
      id: "har",
      targetRole: "TIM PEMELIHARAAN (HAR) & TEKNISI AMC",
      roleBadge: "Khusus Tim Pemeliharaan / HAR",
      appName: "PLN Services HAR (Pemeliharaan & Gangguan)",
      badgeColor: "#b45309",
      badgeBg: "#fef3c7",
      themeGradient: "linear-gradient(135deg, #d97706, #92400e)",
      shortDesc: "Aplikasi khusus Tim Pemeliharaan (HAR) dan Teknisi untuk pelaporan tiket gangguan pembangkit, penanganan inspeksi preventif, checklist pemeliharaan, dan approval AMC.",
      version: "v1.0.0",
      fileSize: "47.2 MB",
      fileSizeBytes: 49475892,
      fileName: "pln-har-mobile-v1.0.0.apk",
      fileUrl: "/downloads/apk/pln-har-mobile-v1.0.0.apk",
      downloadApiUrl: "/api/apk/download?type=har",
      minAndroid: "Android 8.0 (Oreo)+",
      releaseDate: "19 Oktober 2026",
      features: [
        "Pelaporan & Monitoring Tiket Gangguan Pembangkit Real-Time",
        "Manajemen Work Order (WO) Pemeliharaan Mesin & Trafo",
        "Form Checklist HAR & Bukti Foto Lapangan",
        "Validasi & Approval Berjenjang Tim AMC / Pemeliharaan"
      ]
    }
  ]
};

function readReleaseData() {
  if (fs.existsSync(releaseFilePath)) {
    try {
      const data = fs.readFileSync(releaseFilePath, "utf8");
      const parsed = JSON.parse(data);
      if (!parsed.apkList || parsed.apkList.length === 0) {
        parsed.apkList = defaultRelease.apkList;
      }
      return parsed;
    } catch {}
  }
  return defaultRelease;
}

export async function GET() {
  try {
    const data = readReleaseData();
    return NextResponse.json({ success: true, data });
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

    const currentData = readReleaseData();
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Upload file APK langsung)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("apkFile") as File | null;
      const targetApk = (formData.get("targetApk") as string) || "logsheet"; // "logsheet" | "har" | "general"
      const appName = (formData.get("appName") as string) || (targetApk === "har" ? "PLN Services HAR" : "PLN Logsheet PLTD");
      const version = (formData.get("version") as string) || "v1.0.0";
      const buildNumber = (formData.get("buildNumber") as string) || "1";
      const minAndroid = (formData.get("minAndroid") as string) || "Android 8.0 (Oreo) ke atas";
      const changelogRaw = (formData.get("changelog") as string) || "";
      const isActive = formData.get("isActive") !== "false";

      let fileName = targetApk === "har" ? "pln-har-mobile-v1.0.0.apk" : "pln-logsheet-mobile-v1.0.0.apk";
      let fileUrl = `/downloads/apk/${fileName}`;
      let downloadApiUrl = `/api/apk/download?type=${targetApk}`;
      let fileSize = "64.3 MB";
      let fileSizeBytes = 67461867;

      if (file && file.size > 0) {
        const cleanVer = version.replace(/[^a-zA-Z0-9._-]/g, "");
        fileName = targetApk === "har"
          ? `pln-har-mobile-${cleanVer}.apk`
          : `pln-logsheet-mobile-${cleanVer}.apk`;
          
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

      const dateStr = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date());

      // Update specific APK in apkList
      const updatedApkList = (currentData.apkList || defaultRelease.apkList).map((apk: any) => {
        if (apk.id === targetApk || (targetApk === "general" && apk.id === "logsheet")) {
          return {
            ...apk,
            appName,
            version,
            fileUrl,
            downloadApiUrl,
            fileName,
            fileSize,
            fileSizeBytes,
            releaseDate: dateStr,
            minAndroid,
          };
        }
        return apk;
      });

      const updatedRelease = {
        ...currentData,
        appName: targetApk === "har" ? currentData.appName : appName,
        version: targetApk === "har" ? currentData.version : version,
        buildNumber,
        fileUrl: targetApk === "har" ? currentData.fileUrl : fileUrl,
        downloadApiUrl: targetApk === "har" ? currentData.downloadApiUrl : downloadApiUrl,
        fileName: targetApk === "har" ? currentData.fileName : fileName,
        fileSize: targetApk === "har" ? currentData.fileSize : fileSize,
        fileSizeBytes: targetApk === "har" ? currentData.fileSizeBytes : fileSizeBytes,
        releaseDate: dateStr,
        minAndroid,
        isActive,
        changelog,
        apkList: updatedApkList,
      };

      fs.writeFileSync(releaseFilePath, JSON.stringify(updatedRelease, null, 2), "utf8");
      return NextResponse.json({
        success: true,
        message: `Berkas APK ${fileName} (${fileSize}) berhasil di-upload dan dipublikasikan!`,
        data: updatedRelease,
      });
    }

    // 2. JSON Body (Update metadata)
    const body = await req.json();
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
