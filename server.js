import express from "express";
import cors from "cors";
import { runMediaSoupServer } from "./socket-server/mediaServer.js";

// Constants
const isDevelopment = process.env.NODE_ENV === "development";
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

// Create http server
const app = express();

if (isDevelopment) {
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
      appType: "custom",
    })
  );

  app.use(viteDevServer.middlewares);
} else {
  const compression = (await import("compression")).default;
  const handler = (await import("./build/handler.js")).handler;

  app.use(cors());
  app.use(compression());

  app.get("/healthcheck", (req, res) => {
    res.end("ok");
  });
  app.use(handler);
}

const httpServer = await runMediaSoupServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
