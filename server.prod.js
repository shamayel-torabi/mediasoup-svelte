import express from "express";
import cors from "cors";
import { runMediaSoupServer } from "./socket-server/mediaServer.js";

// Constants
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

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

const httpServer = await runMediaSoupServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
