// 1. 引入 dotenv 插件，它的作用是让代码能读懂你的 .env 文件
import 'dotenv/config';
// 2. 从 prisma 的配置包中引入定义函数
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // 指定你的蓝图（Schema）在哪里
  schema: 'prisma/schema.prisma',

  // 指定迁移记录存放在哪里
  migrations: {
    path: 'prisma/migrations',
  },

  // 核心部分：数据源配置
  datasource: {
    /** * 这里使用 process.env["DATABASE_URL"]
     * 意思是从你的 .env 文件里读取那个以 DATABASE_URL 开头的连接字符串
     */
    url: process.env['DATABASE_URL'],
  },
});
