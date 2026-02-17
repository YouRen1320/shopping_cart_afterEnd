import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Product } from './dto/ create-product.dto';

@Injectable()
export class ProductsService {
  // 定义一个私有的，只读的实例属性用于保存商品的实际所在路径，products.json 将路径拼接起来(当前工作路径和文件名拼接起来)
  // /Users/youren/Desktop/Project/.../products.json 绝对路径
  // process.cwd()：永远指向项目根目录
  private readonly filePath = path.join(process.cwd(), 'products.json');

  //商品数据列表
  private Products: Product[] = [];

  // 创建对象的时候立刻执行
  constructor() {
    // 启动的时候读取商品数据
    this.loadProducts();
  }

  //获取所有商品
  getAllProducts() {
    return this.Products;
  }

  // 根据商品id寻找某个商品
  findOne(id: number) {
    return this.Products.find((product) => product.id == id);
  }

  // 上架新的商品
  createProduct(title: string, price: number) {
    const newsProduct: Product = {
      id: Date.now(),
      title,
      price,
    };
    this.Products.push(newsProduct);
    this.saveProducts();
    return newsProduct;
  }

  // 读写文件辅助函数
  // 读取文件内容
  private loadProducts() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.Products = JSON.parse(data) as Product[];
    }
  }

  // 写回本地文件
  private saveProducts() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.Products));
  }
}
