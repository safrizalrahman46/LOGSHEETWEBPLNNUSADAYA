"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCw, ImagePlus, AlertTriangle } from "lucide-react";
import { fileToDataUrl } from "@/lib/media";

type Facing = "environment" | "user";

interface CameraCaptureModalProps {
  open: boolean;
  title: string;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

// Modal kamera live (getUserMedia) — mirror pengalaman CameraCapturePage di app mobile.
export function CameraCaptureModal({ open, title, onCapture, onClose }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nativeCamRef = useRef<HTMLInputElement>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startStream = async (mode: Facing) => {
    stopStream();
    setStarting(true);
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Perangkat/browser ini tidak mendukung kamera live. Gunakan kamera bawaan perangkat.");
      setStarting(false);
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError(
        "Browser memblokir kamera live karena koneksi tidak aman (harus localhost/HTTPS). Gunakan kamera bawaan perangkat."
      );
      setStarting(false);
      return;
    }
    // Cek perangkat kamera yang tersedia
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      if (cams.length === 0) {
        setError("Tidak ada kamera terdeteksi di perangkat ini. Gunakan kamera bawaan perangkat atau galeri.");
        setStarting(false);
        return;
      }
    } catch {
      // lanjutkan, enumerate gagal bukan penghalang
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("Izin kamera ditolak. Klik ikon kamera di address bar untuk mengizinkan, atau pakai kamera bawaan perangkat.");
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        // Coba kamera lain (depan/belakang)
        const fallback: Facing = mode === "environment" ? "user" : "environment";
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: fallback } });
          streamRef.current = stream;
          setFacing(fallback);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }
        } catch {
          setError("Kamera tidak ditemukan. Gunakan kamera bawaan perangkat atau galeri.");
        }
      } else if (name === "NotReadableError" || name === "AbortError") {
        setError("Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.");
      } else {
        setError("Gagal membuka kamera live. Gunakan kamera bawaan perangkat.");
      }
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    startStream(facing);
    return () => {
      stopStream();
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing]);

  if (!open) return null;

  const captureShot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const scale = Math.min(1, 1280 / v.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(v.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(v.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Cerminkan untuk kamera depan agar seperti mirror
    if (facing === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.75));
  };

  return (
    <div className="fixed inset-0 z-[9500] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Kepala */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
              <Camera className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white">{title}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Kamera Live • Tekan shutter untuk mengambil foto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Tutup kamera"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="relative aspect-[4/3] w-full bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />

          {(starting || error) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
              {starting ? (
                <>
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-brand-500" />
                  <p className="text-xs font-semibold text-gray-400">Membuka kamera...</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-8 w-8 text-warning-500" />
                  <p className="text-xs font-semibold leading-relaxed text-gray-300">{error}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => nativeCamRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-brand-600"
                    >
                      <Camera className="h-3.5 w-3.5" /> Buka Kamera HP
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:bg-gray-800"
                    >
                      <ImagePlus className="h-3.5 w-3.5" /> Galeri
                    </button>
                    <button
                      onClick={() => startStream(facing)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:bg-gray-800"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Kontrol */}
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-300 transition-colors hover:bg-gray-800"
          >
            <ImagePlus className="h-4 w-4" /> Galeri
          </button>

          <button
            onClick={captureShot}
            disabled={starting || !!error}
            title="Ambil foto"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white ring-4 ring-brand-500/40 transition-transform active:scale-90 disabled:opacity-40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
              <Camera className="h-5 w-5" />
            </span>
          </button>

          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            title="Ganti kamera depan/belakang"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-300 transition-colors hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" /> Balik
          </button>
        </div>

        <input
          ref={nativeCamRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              onCapture(await fileToDataUrl(file));
            } catch {
              alert("Gagal membaca file foto.");
            }
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              onCapture(await fileToDataUrl(file));
            } catch {
              alert("Gagal membaca file foto.");
            }
          }}
        />
      </div>
    </div>
  );
}

export default CameraCaptureModal;
