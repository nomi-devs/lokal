import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSettingsController } from './notification-settings.controller';
import { AdminNotificationsController } from './admin-notifications.controller';
import { DocumentNotificationPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { UsersModule } from '../users/users.module';
import { VendorsModule } from '../vendors/vendors.module';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    DocumentNotificationPersistenceModule,
    UsersModule,
    VendorsModule,
    PushModule,
  ],
  controllers: [
    NotificationsController,
    NotificationSettingsController,
    AdminNotificationsController,
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
