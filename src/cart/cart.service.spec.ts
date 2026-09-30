import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from 'src/prisma.service';

const prismaMock = {
  product: { findUnique: jest.fn() },
  cartItem: { findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<CartService>(CartService);
  });

  it('服务已定义', () => {
    expect(service).toBeDefined();
  });

  it('加购失败：商品不存在', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(service.addToCart({ productId: 99, quantity: 1 } as any, 1))
      .rejects.toThrow('商品不存在');
  });

  it('加购失败：商品已下架', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1, isActive: false });
    await expect(service.addToCart({ productId: 1, quantity: 1 } as any, 1))
      .rejects.toThrow('该商品已下架，无法添加到购物车');
  });

  it('加购：购物车已有该商品时更新数量而非新增', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1, isActive: true });
    prismaMock.cartItem.findFirst.mockResolvedValue({ id: 10, quantity: 2 });
    const r = await service.addToCart({ productId: 1, quantity: 3 } as any, 7);
    expect(r.message).toBe('商品已添加到购物车！');
    expect(prismaMock.cartItem.update).toHaveBeenCalledWith({
      where: { id: 10 }, data: { quantity: 5 },
    });
    expect(prismaMock.cartItem.create).not.toHaveBeenCalled();
  });

  it('加购：首次加入直接创建', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1, isActive: true });
    prismaMock.cartItem.findFirst.mockResolvedValue(null);
    await service.addToCart({ productId: 1, quantity: 2 } as any, 7);
    expect(prismaMock.cartItem.create).toHaveBeenCalledWith({
      data: { productId: 1, quantity: 2, userId: 7 },
    });
  });

  it('查看购物车：按用户过滤并计算小计与总价', async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([
      { id: 10, quantity: 2, product: { name: 'A', price: 10 } },
      { id: 11, quantity: 1, product: { name: 'B', price: 5.5 } },
    ]);

    const r = await service.getCart(7);

    expect(prismaMock.cartItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 7 },
    }));
    expect(r.items[0]).toEqual({ cartItemId: 10, productName: 'A', price: 10, quantity: 2, subtotal: 20 });
    expect(r.totalPrice).toBe(25.5);
  });

  it('清空购物车只删除当前用户的条目', async () => {
    await service.clearCart(7);
    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 7 } });
  });
});
