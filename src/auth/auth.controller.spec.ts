import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const serviceMock = { login: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('控制器已定义', () => {
    expect(controller).toBeDefined();
  });

  it('login 委托给服务层', async () => {
    const dto = { username: 'alice', password: 'x' };
    serviceMock.login.mockResolvedValue({ access_token: 't' });
    await expect(controller.login(dto)).resolves.toEqual({ access_token: 't' });
    expect(serviceMock.login).toHaveBeenCalledWith('alice', 'x');
  });
});
