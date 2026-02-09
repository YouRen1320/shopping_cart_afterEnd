import { Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 提交订单
  @Post()
  create() {
    return this.ordersService.createOrder();
  }

  // 查看历史订单
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
}
