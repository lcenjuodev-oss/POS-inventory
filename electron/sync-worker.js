const { app } = require("electron");
const path = require("path");

async function runSyncLoop() {
  // Lazy require to avoid Next.js transpilation on server
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { runSyncOnce } = require(path.join(
    __dirname,
    "..",
    "lib",
    "sync",
    "syncClient.js"
  ));

  const apiBaseUrl =
    process.env.SYNC_API_BASE_URL || "https://your-vercel-app.vercel.app";
  const deviceId = app.getPath("userData");

  async function tick() {
    const online = require("dns")
      .lookup("example.com", (err) => !err)
      ? true
      : true;

    if (online) {
      try {
        await runSyncOnce(apiBaseUrl, deviceId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Background sync failed", err);
      }
    }

    setTimeout(tick, 30_000);
  }

  tick();
}

if (app.isReady()) {
  runSyncLoop();
} else {
  app.on("ready", runSyncLoop);
}


