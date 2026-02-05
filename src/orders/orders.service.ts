import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CartService } from 'src/cart/cart.service';

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface orders {
  id: number;
  date: string;
  items: CartItem[];
  totalPrice: number;
}

@Injectable()
export class OrdersService {
  // 订单也需要存文件
  private readonly filePath = path.join(process.cwd(), 'orders.json');
  // 注入购物车数据
  constructor(private readonly cartService: CartService) {}

  // 创建订单
  createOrder() {
    // 1.从当前购物车获取当前商品和总价
    const cartData = this.cartService.getCart();
    // 如果购物车是空的，禁止用户创建订单
    if (cartData.items.length === 0) {
      return { message: '购物车是空的，无法下单' };
    }
    // 2.否则生成一个新的订单对象
    const newOrder: orders = {
      id: Date.now(), // 用时间戳随机模拟一个订单号
      date: new Date().toISOString(), //下单时间
      items: cartData.items, //商品列表
      totalPrice: cartData.totalPrice, //订单总价
    };
    // 3.如果有旧订单的话，把新订单追加进去
    let orders: orders[] = [];
    if (fs.existsSync(this.filePath)) {
      orders = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as orders[];
    }
    orders.push(newOrder);
    // 4.保存订单文件
    fs.writeFileSync(this.filePath, JSON.stringify(orders, null, 2));
    // 5.下单成功以后，清空购物车
    this.cartService.clearCart();
    return {
      message: '下单成功！',
      orderId: newOrder.id,
    };
  }
}
