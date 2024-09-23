import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Oneg Backend')
    .setDescription('Oneg Backend API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  // TODO change cors origins
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT);
}
bootstrap();
