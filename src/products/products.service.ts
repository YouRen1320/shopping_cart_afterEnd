import { Injectable } from '@nestjs/common';

// 定义数据类型
// 首先我们要明白，一个商品有哪些属性，
// 首先是id，商品一定有一个独一无二的id
// 然后是名称，商品一定有一个名称
// 然后是价格，商品一定有一个价格
// 然后是图片，商品一定有一个图片
// 然后是描述，商品一定有一个描述,这里先定义3个类型
interface Product {
  id: number; // id一般是数字类型
  name: string; // 名称是字符串类型
  price: number; //价格是数字类型
}

@Injectable()
export class ProductsService {
  //模拟数据库
  private Products: Product[] = [
    {
      id: 1,
      name: 'iphone 15',
      price: 4999,
    },
    {
      id: 2,
      name: '小米10s',
      price: 4999,
    },
    {
      id: 3,
      name: '华为mate 20',
      price: 8999,
    },
  ];

  //获取所有商品
  getAllProducts() {
    return this.Products;
  }
}
