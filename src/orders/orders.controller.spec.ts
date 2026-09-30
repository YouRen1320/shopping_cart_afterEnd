import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const serviceMock = { createOrder: jest.fn(), findAll: jest.fn() };

const req = { user: { sub: 7 } };

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: serviceMock },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    controller = module.get<OrdersController>(OrdersController);
  });

  it('控制器已定义', () => {
    expect(controller).toBeDefined();
  });

  it('create 以当前登录用户身份下单', async () => {
    serviceMock.createOrder.mockResolvedValue({ orderId: 100 });
    await controller.create(req);
    expect(serviceMock.createOrder).toHaveBeenCalledWith(7);
  });

  it('findAll 查询当前用户的订单', async () => {
    serviceMock.findAll.mockResolvedValue([]);
    await controller.findAll(req);
    expect(serviceMock.findAll).toHaveBeenCalledWith(7);
  });
});
