import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const serviceMock = {
  getAllProducts: jest.fn(),
  createProduct: jest.fn(),
  deactivateProduct: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: serviceMock }],
    }).compile();
    controller = module.get<ProductsController>(ProductsController);
  });

  it('控制器已定义', () => {
    expect(controller).toBeDefined();
  });

  it('findAll 透传查询参数', async () => {
    serviceMock.getAllProducts.mockResolvedValue({ items: [], total: 0 });
    await controller.findAll({ page: '1', limit: '10' });
    expect(serviceMock.getAllProducts).toHaveBeenCalledWith({ page: '1', limit: '10' });
  });

  it('create 透传商品数据', async () => {
    const dto = { name: 'A', price: 5 };
    await controller.create(dto);
    expect(serviceMock.createProduct).toHaveBeenCalledWith('A', 5);
  });

  it('deactivate 透传商品 id', async () => {
    serviceMock.deactivateProduct.mockResolvedValue({ message: 'ok' });
    await controller.deactivate(3);
    expect(serviceMock.deactivateProduct).toHaveBeenCalledWith(3);
  });
});
