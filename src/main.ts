import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

import { PlansService } from './modules/plans/plans.service';
import { NarratorsService } from './modules/narrators/narrators.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  (app as any).disable('x-powered-by');
  app.useLogger(app.get(Logger));
  patchNestJsSwagger();

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
  const narratorsService = app.get(NarratorsService);
  narratorsService.createDefaultNarrators();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
