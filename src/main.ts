import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PlansService } from './modules/plans/plans.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Oneg Backend')
    .setDescription('Oneg Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  // TODO change cors origins
  app.enableCors();

  const plansService = app.get(PlansService);
  plansService.createPlansIfNotExist();

  await app.listen(process.env.PORT);
}
bootstrap();
