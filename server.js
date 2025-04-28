import express from "express";
import { createServer } from "vite";
import runMediaSoupServer from './src/lib/server/mediaServer.js'

// Constants
const isDevelopment = process.env.NODE_ENV === "development";
const port = process.env.PORT || 5173;

// Create http server
const app = express();

if (isDevelopment) {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const handler = (await import("./build/handler.js")).handler;

  app.use(compression());

  app.get("/healthcheck", (req, res) => {
    res.end("ok");
  });
  app.use(handler);
}

runMediaSoupServer(app)

// // Start http server
// app.listen(port, () => {
//   console.log(`Server started at http://localhost:${port}`);
// });
