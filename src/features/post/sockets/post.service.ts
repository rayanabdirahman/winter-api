import { Server, Socket } from 'socket.io';
import loggerHelper from '@globals/helpers/logger';
const logger = loggerHelper.create('[SocketIOPostHandler]');

export interface ISocketIOPostHandler {
  listen(): void;
}

let socketIOPostObj: Server;

export default class SocketIOPostHandler implements ISocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObj = io;
  }

  listen(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.debug('Post socketio handler connected');
    });
  }
}
