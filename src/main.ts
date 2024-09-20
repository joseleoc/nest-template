import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // TODO change cors origins
  app.enableCors({ origin: '*' });
  await app.listen(3000);
}
bootstrap();
