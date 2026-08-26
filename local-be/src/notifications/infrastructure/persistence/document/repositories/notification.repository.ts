import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import type { PushStatus } from '../../../../notifications.constants';
import { Notification } from '../../../../domain/notification';
import {
  CreateNotificationData,
  NotificationRepository,
} from '../../notification.repository';
import {
  NotificationSchemaClass,
  NotificationSchemaDocument,
} from '../entities/notification.schema';
import { NotificationMapper } from '../mappers/notification.mapper';

@Injectable()
export class NotificationsDocumentRepository implements NotificationRepository {
  constructor(
    @InjectModel(NotificationSchemaClass.name)
    private readonly notificationModel: Model<NotificationSchemaDocument>,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const created = await this.notificationModel.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
      isRead: false,
    });
    return NotificationMapper.toDomain(created);
  }

  async createMany(data: CreateNotificationData[]): Promise<Notification[]> {
    if (data.length === 0) return [];
    const created = await this.notificationModel.insertMany(
      data.map((d) => ({
        ...d,
        userId: new Types.ObjectId(d.userId),
        isRead: false,
      })),
    );
    return created.map((n) => NotificationMapper.toDomain(n));
  }

  async findById(id: string): Promise<NullableType<Notification>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const found = await this.notificationModel.findById(id);
    return found ? NotificationMapper.toDomain(found) : null;
  }

  async findManyByUserId(
    userId: string,
    page: number,
    limit: number,
    status: 'all' | 'read' | 'unread' = 'all',
  ): Promise<{ data: Notification[]; total: number }> {
    const query = {
      userId: new Types.ObjectId(userId),
      ...(status === 'read' && { isRead: true }),
      ...(status === 'unread' && { isRead: false }),
    };

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.notificationModel.countDocuments(query),
    ]);

    return { data: data.map((n) => NotificationMapper.toDomain(n)), total };
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markRead(id: string): Promise<NullableType<Notification>> {
    if (!Types.ObjectId.isValid(id)) return null;
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: id },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
    return updated ? NotificationMapper.toDomain(updated) : null;
  }

  async markAllReadByUserId(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async updatePushResult(
    id: string,
    result: { pushStatus: PushStatus },
  ): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: id },
      { pushStatus: result.pushStatus },
    );
  }
}
