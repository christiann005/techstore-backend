import { Controller, Post, Body, Get, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/http/roles.decorator';
import { OrdersService } from '../../application/orders.service';
import { UserRole } from '../../../users/domain/user.entity';
import { OrderStatus } from '../persistence/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Request() req: any, @Body() orderDto: any) {
    const userId = (req.user as any).userId;
    return this.ordersService.createOrder(userId, orderDto.items);
  }

  @Get('my-orders')
  async findMyOrders(@Request() req: any) {
    const userId = (req.user as any).userId;
    return this.ordersService.findUserOrders(userId);
  }

  // Rutas de Administrador
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.ordersService.getAllOrders();
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }
}
