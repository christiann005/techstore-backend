import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Notificar cambio de stock
  emitStockUpdate(productId: string, newStock: number) {
    this.server.emit('stockUpdated', { productId, newStock });
  }

  // Notificar cambio de estado de pedido (A un usuario específico)
  emitOrderStatusUpdate(userId: string, orderId: string, status: string) {
    // Podríamos usar rooms para mayor seguridad, pero por ahora emitiremos globalmente
    // con el userId para que el frontend filtre
    this.server.emit('orderStatusChanged', { userId, orderId, status });
  }
}
