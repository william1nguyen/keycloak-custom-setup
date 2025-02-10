import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

interface LogEntry {
  timestamp: string,
  method: string,
  path: string,
  ip: string | undefined,
  userAgent: string,
  body: string
}

class SocketHandler {
  private io: SocketServer;

  constructor(server: HttpServer) {
    this.io = new SocketServer(server);
    this.setupSocketConnections();
  }

  private setupSocketConnections(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public broadcastLog(logEntry: LogEntry): void {
    console.log("Broadcasting log:", logEntry);
    this.io.emit('new-log', logEntry);
}

  public getIO(): SocketServer {
    return this.io;
  }
}

export default SocketHandler;