import express from "express";
import cors from "cors";

// Constants
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";
const BUILD_PATH_SOCKET = "./build/server/socket/index.js";

// Create http server
const app = express();

const compression = (await import("compression")).default;
const handler = (await import("./build/handler.js")).handler;

app.use(cors());
app.use(compression());

app.get("/healthcheck", (req, res) => {
  res.end("ok");
});
app.use(handler);

const httpServer = await import(BUILD_PATH_SOCKET).then((mod) => mod.createSocketServer(app));

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
