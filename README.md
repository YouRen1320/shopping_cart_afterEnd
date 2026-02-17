1. 这个是购物城项目的后端部分 仿造京东

2. 功能部分
   1. 四个模块，首页，分类，购物车，我的

nesj new shopping_cart_afterEnd // 创建一个新的nestjs项目

如果已经在文件夹中，使用 nest new . 在此文件夹中创建nestjs项目的文件结构

nestjs最基础的三个概念

1. controller 控制器 控制器只接受前端的请求和发出响应，本身不做逻辑处理
2. service服务 服务主要用于处理业务逻辑，计算价格，或者从数据库拿数据
3. module模块，模块的作用就是把控制器和服务组织在一起，类似于flutter里getx中的module，主要也是做中间处理

使用nest cli快速创建结构
nest g resource products
此时终端会问你2个问题
1.使用什么作为传输层？ REST API
2.是否生成增删改查模版？n

同时nestjs非常智能，他会自动把模块注册到app.module.ts中。

然后我们先去service层编写逻辑
我们需要在一个数组中存几个商品，并提供一个方法把他们拿出来
service逻辑写好了以后，我们就去controller中触发业务逻辑

接下来开始创建购物车模块
nest g resource cart
这里，我们需要理解DTO(数据传输对象) 用户往购物车加东西的时候，需要传给我什么数据
一般来说：数量要，商品id需要
在nestjs中，我们通常用一个专门的类来定义这种数据格式，叫DTO

让购物车可以调用商品
需要在商品module中把商品暴露出去
然后在购物车中调用商品函数

为了数据安全，我们需要引入管道，管道的作用就是转换数据和验证数据是否合规
pnpm add class-validator class-transformer
然后我们需要在main.ts中设置全局验证管道
管道的作用就是在数据发送到业务层前判断数据格式是否合规用的，防止接口得到不正常的数据

然后我们开始连接数据库 NestJS + PostgreSQL + Prisma + Docker
新建docker-compose.yml文件，在文件中配置docker信息
使用docker compose up -d 启动docker

数据库启动以后，我们开始配置orm,orm我们使用prisma
pnpm add -D prisma @types/pg
pnpm add @prisma/client @prisma/adapter-pg pg
// Prisma 7 不再支持直连数据库，需要通过 Driver Adapter 连接
// @prisma/adapter-pg 是 PostgreSQL 的适配器，pg 是 Node.js 的 PostgreSQL 驱动
// @types/pg 是 pg 的 TypeScript 类型定义
初始化 npx prisma init
初始化后，项目会多一个prisma文件夹，但 Prisma 7 不再自动生成 .env 文件
需要手动在项目根目录创建 .env 文件，写入数据库连接字符串：
DATABASE_URL="postgresql://账号:密码@localhost:端口/库名"
// 对应我们 docker-compose.yml 中的配置，实际值为：
// DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/shopping_cart"
然后在prisma/schema.prisma 里定义数据模型
数据模型定义好以后，使用命令让Prisma去数据库中真正的创建这张表，使用下面的命令
npx prisma migrate dev --name init // migrate dev 开发模式迁移 --name init 给这次修改起名，比如说初始化
// 开发模式迁移就是数据库的版本控制系统(git) 会把数据库每一次的改动记录成档案
// 开发模式会对比现在的和实际情况，然后把改动翻译成数据库听得懂的SQL语句，并存入prisma/migrations文件中 然后在数据库执行这些SQL语句，让表结构真正的发生变化 --name init 就像 Git 的 Commit Message
Prisma 7更新以后，url = env("DATABASE_URL")的配置现在在prisma.config.ts中了，不去schema.prisma中修改
如果显示 All migrations have been successfully applied，那么PostgreSQL 里已经有一张 Product 表了。

为了能在 Service 里优雅地使用 Prisma，我们需要把它封装成一个 NestJS 的 Service
在 src 下新建一个文件 prisma.service.ts，封装成全局的prisma依赖，供其他地方注入调用
Prisma 7 的关键变化：不再支持直连数据库，需要通过 Driver Adapter 连接
在 prisma.service.ts 中：
1. 用 pg 的 Pool 创建数据库连接池
2. 用 @prisma/adapter-pg 的 PrismaPg 创建适配器
3. 在 super() 中传入 { adapter } 完成初始化
封装好以后，我们需要新建一个src/prisma.module.ts 这个模块的目的是把上述的prisma注册成全局模块，像其他模块一样，注册成模块才能供其他的地方使用，并且不用import

注册成功以后，我们就可以改造其他模块的操作了，从fs文件读写逻辑，全部换成数据库操作
