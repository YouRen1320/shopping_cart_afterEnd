import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

// PrismaService 依赖替身：只模拟测试涉及的方法
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('服务已定义', () => {
    expect(service).toBeDefined();
  });

  it('注册成功：密码加盐哈希存储，且不返回密码', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({
      id: 1, username: data.username, password: data.password,
    }));

    const result = await service.register({ username: 'alice', password: 'plain-123' });

    expect(result.message).toBe('注册成功！');
    expect(result.user).toEqual({ id: 1, username: 'alice' });
    // 存库的是哈希值，不是原密码
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    const stored = prismaMock.user.create.mock.calls[0][0].data.password;
    expect(stored).not.toBe('plain-123');
    expect(await bcrypt.compare('plain-123', stored)).toBe(true);
  });

  it('注册失败：用户名已被注册', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 9, username: 'alice' });

    await expect(service.register({ username: 'alice', password: 'x' }))
      .rejects.toThrow(BadRequestException);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('findOneByUsername 透传查询条件', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: 'bob' });
    await expect(service.findOneByUsername('bob')).resolves.toMatchObject({ id: 1 });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { username: 'bob' } });
  });
});
