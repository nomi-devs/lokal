import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AllConfigType } from './config/config.type';
import { filterDocumentByTags } from './common/swagger/filter-document-by-tags.util';
import {
  DASHBOARD_API_TAGS,
  MOBILE_API_TAGS,
} from './common/swagger/swagger-tags.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService<AllConfigType>);
  const port = configService.getOrThrow('app.port', { infer: true });

  app.enableCors({
    origin: configService.getOrThrow('app.corsOrigins', { infer: true }),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Strips @Exclude()-marked fields (e.g. User.passwordHash) from every
  // response automatically — domain entities declare this once, controllers
  // don't need a manual toPublic()-style mapping per endpoint.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Lokal E-Commerce API')
    .setDescription(
      'API documentation for Customer, Vendor, and Admin services',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Identifier matching @ApiBearerAuth()
    )
    .build();

  // One scan of the app's routes, then split into two UIs by @ApiTags() —
  // see common/swagger/filter-document-by-tags.util.ts. Mobile-only,
  // dashboard-only, and shared (e.g. /auth/refresh-token) endpoints are
  // routed to the right doc(s) without duplicating any controller.
  const fullDocument = SwaggerModule.createDocument(app, config);

  // defaultModelsExpandDepth: -1 hides the bottom "Schemas" panel entirely —
  // the component schemas are still in the document (needed to resolve each
  // endpoint's own request/response $refs), just not rendered as their own section.
  const swaggerUiOptions: SwaggerCustomOptions = {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  };

  const mobileDocument = filterDocumentByTags(fullDocument, MOBILE_API_TAGS);
  mobileDocument.info.title = 'Lokal Mobile API';
  mobileDocument.info.description = 'OTP-based Customer/Driver mobile app API';
  SwaggerModule.setup('api-docs/mobile', app, mobileDocument, swaggerUiOptions);

  const dashboardDocument = filterDocumentByTags(
    fullDocument,
    DASHBOARD_API_TAGS,
  );
  dashboardDocument.info.title = 'Lokal Dashboard API';
  dashboardDocument.info.description =
    'Password-based Vendor/Admin dashboard API';
  SwaggerModule.setup(
    'api-docs/dashboard',
    app,
    dashboardDocument,
    swaggerUiOptions,
  );

  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Mobile API docs: http://localhost:${port}/api-docs/mobile`);
  console.log(
    `Dashboard API docs: http://localhost:${port}/api-docs/dashboard`,
  );
}
void bootstrap();
