import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareWithBcrypt, hashWithBcrypt } from '../common/utils/hash.util';
import { AppException } from '../common/exceptions/app.exception';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { Role } from '../common/constants/auth.constants';
import { AllConfigType } from '../config/config.type';
import { NullableType } from '../utils/types/nullable.type';
import { User } from './domain/user';
import {
  UserRepository,
  ListUsersFilters,
} from './infrastructure/persistence/user.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  findByPhone(phone: string): Promise<NullableType<User>> {
    return this.userRepository.findByPhone(phone);
  }

  findById(id: string): Promise<NullableType<User>> {
    return this.userRepository.findById(id);
  }

  findByIdentifierWithPassword(
    identifier: string,
  ): Promise<NullableType<User>> {
    return this.userRepository.findByIdentifierWithPassword(identifier);
  }

  createCustomer(phone: string): Promise<User> {
    return this.userRepository.create({
      phone,
      firstName: '',
      lastName: '',
      role: 'customer',
      status: 'active',
      language: 'en',
      timezone: 'Asia/Kuwait',
      fcmTokens: [],
      loginAttempts: 0,
      isPhoneVerified: true,
      rating: 0,
      reviewCount: 0,
    });
  }

  async createWithPassword(data: {
    phone: string;
    email?: string;
    firstName: string;
    lastName: string;
    password: string;
    role: Role;
  }): Promise<User> {
    const existingPhone = await this.userRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new AppException(
        ERROR_CODES.USER_ALREADY_EXISTS,
        'User already registered with this phone',
        409,
      );
    }
    if (data.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppException(
          ERROR_CODES.EMAIL_ALREADY_IN_USE,
          'Email already in use',
          409,
        );
      }
    }

    const rounds = this.configService.getOrThrow('auth.bcryptRounds', {
      infer: true,
    });
    const passwordHash = await hashWithBcrypt(data.password, rounds);

    return this.userRepository.create({
      phone: data.phone,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: data.role,
      status: 'active',
      language: 'en',
      timezone: 'Asia/Kuwait',
      fcmTokens: [],
      loginAttempts: 0,
      isPhoneVerified: true,
      rating: 0,
      reviewCount: 0,
    });
  }

  verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) return Promise.resolve(false);
    return compareWithBcrypt(password, user.passwordHash);
  }

  async touchLogin(userId: string, ip?: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLogin: new Date(),
      lastLoginIp: ip,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new AppException(
          ERROR_CODES.EMAIL_ALREADY_IN_USE,
          'Email already in use',
          409,
        );
      }
    }
    const user = await this.userRepository.update(userId, dto);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    return user;
  }

  registerFcmToken(userId: string, dto: RegisterFcmTokenDto): Promise<void> {
    return this.userRepository.pushFcmToken(userId, dto);
  }

  removeFcmTokenById(userId: string, tokenId: string): Promise<void> {
    return this.userRepository.pullFcmTokenById(userId, tokenId);
  }

  removeFcmTokenByToken(userId: string, token: string): Promise<void> {
    return this.userRepository.pullFcmTokenByToken(userId, token);
  }

  async softDelete(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    await this.userRepository.softDelete(userId);
  }

  list(filters: ListUsersFilters): Promise<{ data: User[]; total: number }> {
    return this.userRepository.findManyWithPagination(filters);
  }

  findManyByIds(ids: string[]): Promise<User[]> {
    return this.userRepository.findManyByIds(ids);
  }

  async setStatus(userId: string, status: User['status']): Promise<void> {
    await this.userRepository.update(userId, { status });
  }

  async setVendorId(userId: string, vendorId: string): Promise<void> {
    await this.userRepository.update(userId, { vendorId });
  }

  async updateStatus(
    userId: string,
    status: User['status'],
    requestingAdminId: string,
  ): Promise<User> {
    if (userId === requestingAdminId && status !== 'active') {
      throw new AppException(
        ERROR_CODES.FORBIDDEN,
        'Cannot deactivate own admin account',
        403,
      );
    }
    const user = await this.userRepository.update(userId, { status });
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    return user;
  }

  async hardDelete(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppException(ERROR_CODES.USER_NOT_FOUND, 'User not found', 404);
    }
    await this.userRepository.remove(userId);
  }

  countByRole(role: Role): Promise<number> {
    return this.userRepository.countByRole(role);
  }

  countActive(): Promise<number> {
    return this.userRepository.countActive();
  }

  countRegisteredSince(since: Date): Promise<number> {
    return this.userRepository.countRegisteredSince(since);
  }

  countAll(): Promise<number> {
    return this.userRepository.countAll();
  }
}
