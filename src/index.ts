import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import dotenv from "dotenv"
import SocketHandler, { LogEntry } from "./wsocket";
import path from "node:path";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const socketHandler = new SocketHandler(httpServer);

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/socket.io')) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'Unknown',
      payload: req.body
    };
    socketHandler.broadcastLog(logEntry);
  }
  next();
};

app.use(express.json());
app.use(logMiddleware);
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook Body:", req.body);
  res.status(200).json({
    status: "OK",
    body: req.body,
  });
});

const PORT = 8000;
httpServer.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
