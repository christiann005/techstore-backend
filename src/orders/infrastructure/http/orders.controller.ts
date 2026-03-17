import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { OrdersService } from '../../application/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() orderDto: any) {
    const userId = (req.user as any).userId;
    return this.ordersService.createOrder(userId, orderDto.items);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async findMyOrders(@Request() req: any) {
    const userId = (req.user as any).userId;
    return this.ordersService.findUserOrders(userId);
  }
}
