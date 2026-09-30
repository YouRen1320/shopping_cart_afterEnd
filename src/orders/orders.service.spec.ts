import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from 'src/prisma.service';

const cartItem = (id: number, qty: number, stock: number, price: number, name: string) => ({
  productId: id, quantity: qty, product: { id, stock, price, name },
});

describe('OrdersService', () => {
  let service: OrdersService;
  let txMock: Record<string, any>;
  let prismaMock: Record<string, any>;

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock = {
      order: {
        create: jest.fn().mockResolvedValue({ id: 100, totalPrice: 30, status: 'PENDING' }),
        update: jest.fn(),
      },
      product: { update: jest.fn() },
      cartItem: { deleteMany: jest.fn() },
    };
    prismaMock = {
      cartItem: { findMany: jest.fn(), deleteMany: jest.fn() },
      product: { update: jest.fn() },
      order: { findMany: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(async (fn) => fn(txMock)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  it('服务已定义', () => {
    expect(service).toBeDefined();
  });

  it('下单失败：购物车为空', async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([]);
    await expect(service.createOrder(1)).rejects.toThrow('购物车是空的，无法下单');
  });

  it('下单失败：库存不足', async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([cartItem(1, 5, 2, 10, 'A')]);
    await expect(service.createOrder(1)).rejects.toThrow('商品 A 库存不足');
  });

  it('下单成功：事务内创建订单、扣库存并清空购物车，总价按数量累加', async () => {
    prismaMock.cartItem.findMany.mockResolvedValue([
      cartItem(1, 2, 10, 10, 'A'), cartItem(2, 1, 10, 10, 'B'),
    ]);

    const result = await service.createOrder(7);

    expect(result).toMatchObject({ orderId: 100, totalPrice: 30, status: 'PENDING' });
    expect(txMock.order.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 7, totalPrice: 30 }),
    }));
    // 两种商品各扣减一次库存
    expect(txMock.product.update).toHaveBeenCalledTimes(2);
    expect(txMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 7 } });
  });

  it('订单巡逻：取消超时订单并按明细归还库存', async () => {
    prismaMock.order.findMany.mockResolvedValue([
      { id: 100, status: 'PENDING', items: [{ productId: 1, quantity: 2 }] },
    ]);

    await service.cancelUnpaidOrders();

    // 服务在事务内使用事务客户端 tx（而非 prismaMock 本体）执行取消与库存归还
    expect(txMock.order.update).toHaveBeenCalledWith({
      where: { id: 100 }, data: { status: 'CANCELLED' },
    });
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 1 }, data: { stock: { increment: 2 } },
    });
  });

  it('订单巡逻：无超时订单时不做任何更新', async () => {
    prismaMock.order.findMany.mockResolvedValue([]);
    await service.cancelUnpaidOrders();
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });
});
