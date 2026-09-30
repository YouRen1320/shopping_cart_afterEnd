import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from 'src/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const prismaMock = {
  product: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
// 缓存替身：内存版 get/set + 模拟 redis client 的 keys/del
const cacheMock = {
  get: jest.fn(),
  set: jest.fn(),
  store: { client: { keys: jest.fn().mockResolvedValue([]), del: jest.fn() } },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    cacheMock.get.mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CACHE_MANAGER, useValue: cacheMock },
      ],
    }).compile();
    service = module.get<ProductsService>(ProductsService);
  });

  it('服务已定义', () => {
    expect(service).toBeDefined();
  });

  it('列表：缓存未命中时查库并写入缓存，返回分页元信息', async () => {
    prismaMock.product.findMany.mockResolvedValue([{ id: 1, name: 'A' }]);
    prismaMock.product.count.mockResolvedValue(11);

    const result = await service.getAllProducts({ page: 2, limit: 10 });

    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(1);
    expect(cacheMock.set).toHaveBeenCalledWith(
      'products:page=2:limit=10:keyword=', expect.anything(), 60 * 1000,
    );
  });

  it('列表：缓存命中时不查数据库', async () => {
    cacheMock.get.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });

    await service.getAllProducts({});

    expect(prismaMock.product.findMany).not.toHaveBeenCalled();
  });

  it('创建商品后清除商品列表缓存', async () => {
    cacheMock.store.client.keys.mockResolvedValue(['products:page=1:limit=10:keyword=']);
    prismaMock.product.create.mockResolvedValue({ id: 1, name: 'A', price: 5 });
    await service.createProduct('A', 5);
    expect(cacheMock.store.client.keys).toHaveBeenCalledWith('products:*');
    expect(cacheMock.store.client.del).toHaveBeenCalledWith(['products:page=1:limit=10:keyword=']);
  });

  it('下架：商品不存在抛 404', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);
    await expect(service.deactivateProduct(99)).rejects.toThrow(NotFoundException);
  });

  it('下架：已是下架状态时返回提示且不再更新', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1, name: 'A', isActive: false });
    const r = await service.deactivateProduct(1);
    expect(r.message).toBe('该商品已经是下架状态');
    expect(prismaMock.product.update).not.toHaveBeenCalled();
  });

  it('下架：软删除并清缓存', async () => {
    prismaMock.product.findUnique.mockResolvedValue({ id: 1, name: 'A', isActive: true });
    const r = await service.deactivateProduct(1);
    expect(r.message).toContain('已下架');
    expect(prismaMock.product.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isActive: false } });
  });
});
