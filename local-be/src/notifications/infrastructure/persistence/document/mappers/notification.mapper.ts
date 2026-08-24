import { Notification } from '../../../../domain/notification';
import { NotificationSchemaClass } from '../entities/notification.schema';

export class NotificationMapper {
  static toDomain(raw: NotificationSchemaClass): Notification {
    const domainEntity = new Notification();
    domainEntity.id = raw._id.toString();
    domainEntity.userId = raw.userId.toString();
    domainEntity.type = raw.type;
    domainEntity.title = raw.title;
    domainEntity.titleAr = raw.titleAr;
    domainEntity.body = raw.body;
    domainEntity.bodyAr = raw.bodyAr;
    domainEntity.data = raw.data ?? null;
    domainEntity.isRead = raw.isRead;
    domainEntity.readAt = raw.readAt;
    domainEntity.pushStatus = raw.pushStatus;
    domainEntity.createdAt = raw.createdAt as Date;
    domainEntity.updatedAt = raw.updatedAt as Date;
    return domainEntity;
  }
}
