import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() //全局模块
@Module({
  providers: [PrismaService], // 提供者：导入PrismaService
  exports: [PrismaService], // 导出service供其他模块使用
})
export class PrismaModule {} // 导出这个类 导出模块
