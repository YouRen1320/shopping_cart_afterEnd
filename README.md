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
