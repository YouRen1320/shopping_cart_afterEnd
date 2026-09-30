import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const serviceMock = { register: jest.fn(), findOneByUsername: jest.fn() };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  it('控制器已定义', () => {
    expect(controller).toBeDefined();
  });

  it('register 委托给服务层', async () => {
    const dto = { username: 'alice', password: 'x' };
    serviceMock.register.mockResolvedValue({ message: '注册成功！' });
    await expect(controller.register(dto)).resolves.toEqual({ message: '注册成功！' });
    expect(serviceMock.register).toHaveBeenCalledWith(dto);
  });
});
