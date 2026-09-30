import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

const usersMock = { findOneByUsername: jest.fn() };
const jwtMock = { signAsync: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('服务已定义', () => {
    expect(service).toBeDefined();
  });

  it('登录失败：用户不存在', async () => {
    usersMock.findOneByUsername.mockResolvedValue(null);
    await expect(service.login('nobody', 'x')).rejects.toThrow(UnauthorizedException);
  });

  it('登录失败：密码错误', async () => {
    usersMock.findOneByUsername.mockResolvedValue({
      id: 1, username: 'alice', password: await bcrypt.hash('right', 10),
    });
    await expect(service.login('alice', 'wrong')).rejects.toThrow(UnauthorizedException);
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('登录成功：签发只含 id 与用户名的 Token', async () => {
    usersMock.findOneByUsername.mockResolvedValue({
      id: 1, username: 'alice', password: await bcrypt.hash('right', 10),
    });
    jwtMock.signAsync.mockResolvedValue('token-abc');

    const r = await service.login('alice', 'right');

    expect(r.message).toBe('登录成功！');
    expect(r.access_token).toBe('token-abc');
    expect(jwtMock.signAsync).toHaveBeenCalledWith({ sub: 1, username: 'alice' });
  });
});
