import { Injectable } from '@nestjs/common';
import { createCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartService {
  // 1.模拟数据库
  private cart: createCartDto[] = [];

  // 2.添加数据到数据库中,item是用户传输的数据
  addToCart(item: createCartDto) {
    this.cart.push(item);
    return '商品已添加到购物车！';
  }

  // 3.查看购物车
  getCart() {
    return this.cart;
  }
}
