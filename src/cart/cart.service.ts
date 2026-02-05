import { Injectable } from '@nestjs/common';
import { createCartDto } from './dto/create-cart.dto';
import { ProductsService } from 'src/products/products.service'; //引入商品逻辑函数
import * as fs from 'fs'; //引入node.js中自带的文件操作模块
import * as path from 'path';

@Injectable()
export class CartService {
  // 1.模拟数据库
  private cart: createCartDto[] = [];
  // 定义存档文件的位置：在项目根目录下创建一个data.json
  private readonly filePath = path.join(process.cwd(), 'data.json');

  // nestjs最强大地方就在于依赖注入，我们引用了商品模块的函数，所以在购物车模块，我们需要注入进来
  // 注入 ProductsService 这样我们就能在购物车里，使用商品部的能力
  constructor(private readonly productsService: ProductsService) {
    // 服务启动时，尝试读取"存档"
    this.loadCart();
  }

  // 2.添加数据到数据库中,item是用户传输的数据
  addToCart(item: createCartDto) {
    const existingItem = this.cart.find(
      (item) => item.productId === item.productId,
    );
    // 判断购物车是否有这个商品，如果有数量加1
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      // 如果没有这个商品，就把商品添加到购物车中
      this.cart.push(item);
    }
    this.saveCart();
    return '商品已添加到购物车！';
  }

  // 3.查看购物车
  getCart() {
    // 这里的逻辑是：遍历用户购物车里面的每一项，根据用户购物车的id，去商品的数据库里面查找这个商品详情，然后计算总价
    // items是用户购物车所有的商品
    const items = this.cart
      .map((item) => {
        // 查找用户购物车商品
        const product = this.productsService.findOne(item.productId);

        // 如果商品不存在，就给个错误提示
        if (!product) return null;

        return {
          title: product.title, //商品名称
          price: product.price, //商品价格
          quantity: item.quantity, //商品数量
          subtotal: product.price * item.quantity, //某个商品的总计价格（单价*数量）
        };
      })
      .filter((item) => item !== null); //过滤找不到的商品

    // total 计算购物车的金额
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items: items, //某个商品全部信息
      totalPrice: total, //购物车总价格
    };
  }

  // 4.清空购物车
  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  // 辅助方法(读写文件)
  private saveCart() {
    // 把内存里的数组，转换为字符串，写进文件
    fs.writeFileSync(this.filePath, JSON.stringify(this.cart, null, 2));
  }

  private loadCart() {
    // 如果文件存在，就读出来
    if (fs.existsSync(this.filePath)) {
      const date = fs.readFileSync(this.filePath, 'utf-8');
      this.cart = JSON.parse(date) as createCartDto[];
    }
  }
}
