import { Logger } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  (app as any).disable('x-powered-by');
  app.useLogger(app.get(Logger));

  // Swagger config
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nest template')
      .setDescription('Nest template API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));
  }

  // TODO change cors origins
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT);
}
bootstrap();
