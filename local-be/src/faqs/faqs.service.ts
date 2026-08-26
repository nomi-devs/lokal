import { Injectable } from '@nestjs/common';
import { NullableType } from '../utils/types/nullable.type';
import { ERROR_CODES } from '../common/exceptions/error-codes';
import { findOrThrow } from '../common/utils/find-or-throw.util';
import { Faq } from './domain/faq';
import { FaqRepository } from './infrastructure/persistence/faq.repository';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly faqRepository: FaqRepository) {}

  create(dto: CreateFaqDto): Promise<Faq> {
    return this.faqRepository.create({
      questionEn: dto.questionEn,
      questionAr: dto.questionAr,
      answerEn: dto.answerEn,
      answerAr: dto.answerAr,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    await this.getOrThrow(id);
    const updated = await this.faqRepository.update(id, dto);
    return updated as Faq;
  }

  findById(id: string): Promise<NullableType<Faq>> {
    return this.faqRepository.findById(id);
  }

  list(page: number, limit: number): Promise<{ data: Faq[]; total: number }> {
    return this.faqRepository.findAll(page, limit);
  }

  findActive(): Promise<Faq[]> {
    return this.faqRepository.findActive();
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.faqRepository.remove(id);
  }

  private getOrThrow(id: string): Promise<Faq> {
    return findOrThrow(
      this.faqRepository.findById(id),
      ERROR_CODES.FAQ_NOT_FOUND,
      'FAQ not found',
    );
  }
}
