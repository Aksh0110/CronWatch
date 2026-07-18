import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS so frontend (or agents) can communicate easily
  app.enableCors();

  // Setup Swagger API documentation
  const configService = app.get(ConfigService);
  const appName = configService.get<string>('appName') || 'CronWatch';
  const port = configService.get<number>('port') || 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle(`${appName} Monitoring API`)
    .setDescription('Central monitoring server to collect system heartbeats and cron execution events from multiple backend hosts.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`🚀 ${appName} server is running on: http://localhost:${port}`);
  console.log(`📖 Swagger API documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
