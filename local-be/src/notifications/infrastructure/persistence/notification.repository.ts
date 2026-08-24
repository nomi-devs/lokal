import { NullableType } from '../../../utils/types/nullable.type';
import { Notification } from '../../domain/notification';
import type {
  NotificationType,
  PushStatus,
} from '../../notifications.constants';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  data?: Record<string, unknown> | null;
}

export abstract class NotificationRepository {
  abstract create(data: CreateNotificationData): Promise<Notification>;
  abstract createMany(data: CreateNotificationData[]): Promise<Notification[]>;

  abstract findById(id: string): Promise<NullableType<Notification>>;
  abstract findManyByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Notification[]; total: number }>;
  abstract countUnreadByUserId(userId: string): Promise<number>;

  abstract markRead(id: string): Promise<NullableType<Notification>>;
  abstract markAllReadByUserId(userId: string): Promise<void>;

  abstract updatePushResult(
    id: string,
    result: { pushStatus: PushStatus },
  ): Promise<void>;
}
