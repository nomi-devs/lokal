import { NullableType } from '../../../utils/types/nullable.type';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { Role } from '../../../common/constants/auth.constants';
import { User } from '../../domain/user';

export interface ListUsersFilters {
  page: number;
  limit: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface FcmTokenInput {
  fcmToken: string;
  device: 'ios' | 'android';
}

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User>;

  abstract findById(id: User['id']): Promise<NullableType<User>>;
  abstract findByPhone(phone: User['phone']): Promise<NullableType<User>>;

  // Includes passwordHash (select:false at the schema level otherwise) —
  // only used by the password-login path.
  abstract findByIdentifierWithPassword(
    identifier: string,
  ): Promise<NullableType<User>>;
  abstract findByEmail(email: string): Promise<NullableType<User>>;

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
  ): Promise<NullableType<User>>;
  abstract pushFcmToken(id: User['id'], input: FcmTokenInput): Promise<void>;
  abstract pullFcmTokenById(id: User['id'], tokenId: string): Promise<void>;
  abstract pullFcmTokenByToken(id: User['id'], token: string): Promise<void>;

  abstract softDelete(id: User['id']): Promise<void>;
  abstract remove(id: User['id']): Promise<void>;

  abstract findManyWithPagination(
    filters: ListUsersFilters,
  ): Promise<{ data: User[]; total: number }>;
  abstract findManyByIds(ids: User['id'][]): Promise<User[]>;

  abstract countByRole(role: Role): Promise<number>;
  abstract countActive(): Promise<number>;
  abstract countRegisteredSince(since: Date): Promise<number>;
  abstract countAll(): Promise<number>;
}
