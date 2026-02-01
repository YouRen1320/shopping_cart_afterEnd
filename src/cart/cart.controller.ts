import { Body, Controller, Get, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { createCartDto } from './dto/create-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // post请求，添加商品到购物车中,提交数据。告诉 Nest 这是一个用来“提交数据”的接口。
  @Post()
  add(@Body() body: createCartDto) {
    //body获取用户传输归来的请求体数据，并解析出来
    // 这里的body就是用户传过来的请求体数据 类型是dto类型的，createCartDto
    return this.cartService.addToCart(body);
  }

  // get请求，获取购物车数据
  @Get()
  findAll() {
    return this.cartService.getCart();
  }
}
