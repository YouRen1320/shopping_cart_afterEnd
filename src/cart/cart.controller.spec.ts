import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from 'src/prisma.service';

const serviceMock = { addToCart: jest.fn(), getCart: jest.fn(), clearCart: jest.fn() };

describe('CartController', () => {
  let controller: CartController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: CartService, useValue: serviceMock },
        { provide: PrismaService, useValue: {} },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    controller = module.get<CartController>(CartController);
  });

  it('控制器已定义', () => {
    expect(controller).toBeDefined();
  });

  it('加购请求委托给服务层', async () => {
    serviceMock.addToCart.mockResolvedValue({ message: '商品已添加到购物车！' });
    const dto = { productId: 1, quantity: 2 };
    await controller.add(dto, { user: { sub: 7 } } as any);
    expect(serviceMock.addToCart).toHaveBeenCalledWith(dto, 7);
  });
});
