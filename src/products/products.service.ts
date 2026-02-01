import { Injectable } from '@nestjs/common';

// 定义数据类型
// 首先我们要明白，一个商品有哪些属性，
interface Product {
  id: number;
  title: string; // 商品标题
  price: number; // 价格
  coverUrl?: string; // 封面图链接
  tags?: string[]; // 标签（比如：京东超市、包邮、看相似）
  commentCount?: string; // 评论数（比如：100+条评论）
  shopName?: string; // 店铺名称
}

@Injectable()
export class ProductsService {
  //模拟数据库
  private Products: Product[] = [
    {
      id: 1,
      title: 'iphone 15',
      price: 4999,
    },
    {
      id: 2,
      title: '小米10s',
      price: 4999,
    },
    {
      id: 3,
      title: '华为mate 20',
      price: 8999,
    },
  ];

  //获取所有商品
  getAllProducts() {
    return this.Products;
  }
}
