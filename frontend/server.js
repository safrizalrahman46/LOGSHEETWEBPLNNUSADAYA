const http = require("http");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = false;
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// Prevent event loop from ever exiting
const heartbeat = setInterval(() => {
  // Keep alive heartbeat every 30 seconds
}, 30000);

process.on("uncaughtException", (err) => {
  console.error("[SERVER] Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[SERVER] Unhandled Rejection:", reason);
});

process.on("SIGINT", () => {
  console.log("[SERVER] Received SIGINT, ignoring for persistence");
});

process.on("SIGTERM", () => {
  console.log("[SERVER] Received SIGTERM, ignoring for persistence");
});

if (process.platform === "win32") {
  process.on("SIGBREAK", () => {
    console.log("[SERVER] Received SIGBREAK, ignoring for persistence");
  });
}

process.on("exit", (code) => {
  console.log("[SERVER] Process exit called with code:", code);
});

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // Prevent stale HTML caching so browsers always load matching chunk hashes
    if (
      !req.url.startsWith("/_next/static/") &&
      !req.url.startsWith("/images/") &&
      !req.url.startsWith("/videos/") &&
      !req.url.startsWith("/favicon.ico")
    ) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    handle(req, res);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  server.listen(port, "0.0.0.0", (err) => {
    if (err) {
      console.error("[SERVER] Listen error:", err);
      return;
    }
    console.log(`> PLN Nusa Daya Web ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("[SERVER] Error preparing Next.js app:", err);
});
