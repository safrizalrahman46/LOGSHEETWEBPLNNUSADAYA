import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const releaseFilePath = path.join(process.cwd(), "public", "downloads", "apk", "release.json");
const apkDir = path.join(process.cwd(), "public", "downloads", "apk");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("type") || "logsheet"; // "logsheet" | "har" | "all"
    const requestedFile = searchParams.get("file");

    let fileName = "pln-logsheet-mobile-v1.0.0.apk";
    if (requestedFile) {
      // Sanitize requested file to prevent directory traversal
      fileName = path.basename(requestedFile);
    } else if (targetType === "har") {
      fileName = "pln-har-mobile-v1.0.0.apk";
    } else {
      fileName = "pln-logsheet-mobile-v1.0.0.apk";
    }

    const filePath = path.join(apkDir, fileName);

    if (!fs.existsSync(filePath)) {
      // Check fallback in apkDir
      const availableFiles = fs.existsSync(apkDir) ? fs.readdirSync(apkDir) : [];
      const fallbackApk = availableFiles.find((f) => f.endsWith(".apk"));
      if (fallbackApk) {
        fileName = fallbackApk;
      } else {
        return NextResponse.json(
          { success: false, message: `Berkas APK ${fileName} tidak ditemukan di server.` },
          { status: 404 }
        );
      }
    }

    const finalPath = path.join(apkDir, fileName);
    const stats = fs.statSync(finalPath);
    const fileStream = fs.createReadStream(finalPath);

    // Increment download counter asynchronously in release.json
    try {
      if (fs.existsSync(releaseFilePath)) {
        const raw = fs.readFileSync(releaseFilePath, "utf8");
        const json = JSON.parse(raw);
        json.downloadCount = (json.downloadCount || 0) + 1;
        fs.writeFileSync(releaseFilePath, JSON.stringify(json, null, 2), "utf8");
      }
    } catch {
      // Non-critical counter increment failure
    }

    // Convert ReadStream to ReadableStream for web response
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": stats.size.toString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengunduh berkas APK" },
      { status: 500 }
    );
  }
}
