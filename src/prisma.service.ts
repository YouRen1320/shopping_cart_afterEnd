import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 这段代码是nestjs与prisma结合的核心，作用是创建一个全局可用的数据库服务
// 用来开启在docker中运行的Postgres数据库
// Injectable 在其他的service中写上他，nestjs会自动把数据库实例交出去
// extends PrisamClient 继承 让prismaService拥有了prisma所有操作数据库的能力，不需要手动实例化
// implements OnModuleInit, OnModuleDestroy 实现nestjs的生命周期接口，在生命周期中实现相应的规则，服务启动的时候干嘛
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 生命周期
  async onModuleInit() {
    await this.$connect(); // 启动时连接数据库
  }

  async onModuleDestroy() {
    await this.$disconnect(); // 关闭时断开连接
  }
}
