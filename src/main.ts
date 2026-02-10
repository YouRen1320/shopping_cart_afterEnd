import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 引入验证管道

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 开启全局验证管道 app.useGlobalPipes(...) 这行的意思是设置全局关卡，项目中的所有接口都会先经过ValidationPipe的检查
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动剔除用户多传的、我们在DTO中没定义的属性（防止恶意的数据注入） 只允许DTO中定义过的属性通过
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
