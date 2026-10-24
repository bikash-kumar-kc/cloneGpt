import { Server as HttpServer } from "http";
import { Socket, Server as SocketServer } from "socket.io";

class SocketService {
  private io: SocketServer | null = null;
  private socketCollection = new Map<String, Socket>();
  constructor(
    private httpServer: HttpServer,
    private origin: string,
    private httpMethods: string[],
    private pingTimeout = 120000,
    private pingInterval = 30000,
  ) {
    if (!this.io) {
      this.io = new SocketServer(this.httpServer, {
        cors: {
          origin: this.origin,
          methods: this.httpMethods,
        },
        pingTimeout: this.pingTimeout,
        pingInterval: this.pingInterval,
      });

      this.io.on("connection", (socket) => {
        console.log(
          "[socket service connection event] connection successfully.",
        );
        socket.on("registerUser", ({ userId }: { userId: string }) =>
          this.handleCredentialsEvent({ userId, socket }),
        );

        socket.on("disconnect", () => {
          for (const [uId, sConn] of this.socketCollection) {
            if (sConn === socket) {
              this.socketCollection.delete(uId);
              console.log(uId, "Disconnect");
            }
          }
        });
      });
    }
  }

  private handleCredentialsEvent = ({
    userId,
    socket,
  }: {
    userId: string;
    socket: Socket;
  }) => {
    if (this.socketCollection.get(userId)) {
      this.removeSocket({ userId });
      console.log("existing connection is removed");
    }
    this.socketCollection.set(userId, socket);
    console.log(this.socketCollection);

    console.log("[socket service] register the user");
  };

  public getSocket = ({ userId }: { userId: string }) => {
    if (userId) {
      return this.socketCollection.get(userId);
    }
    console.log("[socket service] connection not found");
  };

  private removeSocket = ({ userId }: { userId: string }) => {
    if (userId) {
      this.socketCollection.delete(userId);
    }
  };
}

export default SocketService;
