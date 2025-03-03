import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import SocketHandler, { LogEntry } from "./wsocket";
import path from "node:path";
import crypto from "crypto";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const socketHandler = new SocketHandler(httpServer);

const KEYCLOAK_SECRET_KEY = "mysecretkey";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" || req.path.startsWith("/socket.io")) {
    return next();
  }

  const signatureHeader = req.headers["x-keycloak-signature"];
  const encoding = "hex";

  if (!signatureHeader) {
    res.status(401).json({ error: "Unauthorized. Missing signature." });
    return;
  }

  try {
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    if (!signature) {
      res
        .status(401)
        .json({ error: "Unauthorized. Invalid signature format." });
      return;
    }

    const hmac = crypto.createHmac("sha256", KEYCLOAK_SECRET_KEY);

    const body =
      typeof req.body === "object" ? JSON.stringify(req.body) : req.body;

    hmac.update(body);

    const expectedSignature = hmac.digest(encoding);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, encoding as BufferEncoding),
      Buffer.from(expectedSignature, encoding as BufferEncoding)
    );

    if (isValid) {
      return next();
    } else {
      res.status(401).json({ error: "Unauthorized. Invalid signature." });
      return;
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized. Authentication failed." });
    return;
  }
};

const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith("/socket.io")) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent") || "Unknown",
      headers: req.headers,
      payload: req.body,
    };
    socketHandler.broadcastLog(logEntry);
  }
  next();
};

app.use(express.json());
app.use(authMiddleware);
app.use(logMiddleware);
app.use(express.static(path.join(__dirname, "../public")));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.post("/webhook", async (req, res) => {
  console.log("Headers: ", req.headers);
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
