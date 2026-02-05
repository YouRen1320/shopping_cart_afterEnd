import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [CartModule], //注册导入购物车模块
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
