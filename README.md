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
pnpm add -D prisma
pnpm add @prisma/client
初始化 npx prisma init
初始化后，项目会多一个prisma文件夹和一个.env文件
打开.env文件，找到database，修改为在docker-compose配置的账户和密码
格式: postgresql://账号:密码@localhost:端口/库名
然后在prisma/schema.prisma 里定义数据模型
数据模型定义好以后，使用命令让Prisma去数据库中真正的创建这张表，使用下面的命令
npx prisma migrate dev --name init // migrate dev 开发模式迁移 --name init 给这次修改起名，比如说初始化
// 开发模式迁移就是数据库的版本控制系统(git) 会把数据库每一次的改动记录成档案
// 开发模式会对比现在的和实际情况，然后把改动翻译成数据库听得懂的SQL语句，并存入prisma/migrations文件中 然后在数据库执行这些SQL语句，让表结构真正的发生变化 --name init 就像 Git 的 Commit Message
Prisma 7更新以后，url      = env("DATABASE_URL")的配置现在在prisma.config.ts中了，不去schema.prisame中修改
如果显示 All migrations have been successfully applied，那么PostgreSQL 里已经有一张 Product 表了。

为了能在 Service 里优雅地使用 Prisma，我们需要把它封装成一个 NestJS 的 Service
在 src 下新建一个文件 prisma.service.ts，把它注册成一个全局模块
