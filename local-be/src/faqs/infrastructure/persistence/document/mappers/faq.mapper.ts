import { Faq } from '../../../../domain/faq';
import { FaqSchemaClass } from '../entities/faq.schema';

export class FaqMapper {
  static toDomain(raw: FaqSchemaClass): Faq {
    const entity = new Faq();
    entity.id = raw._id;
    entity.questionEn = raw.questionEn;
    entity.questionAr = raw.questionAr;
    entity.answerEn = raw.answerEn;
    entity.answerAr = raw.answerAr;
    entity.sortOrder = raw.sortOrder ?? 0;
    entity.isActive = raw.isActive;
    entity.createdAt = raw.createdAt as Date;
    entity.updatedAt = raw.updatedAt as Date;
    return entity;
  }

  static toPersistence(domain: Partial<Faq>): Partial<FaqSchemaClass> {
    const doc: Partial<FaqSchemaClass> = {};
    if (domain.questionEn !== undefined) doc.questionEn = domain.questionEn;
    if (domain.questionAr !== undefined) doc.questionAr = domain.questionAr;
    if (domain.answerEn !== undefined) doc.answerEn = domain.answerEn;
    if (domain.answerAr !== undefined) doc.answerAr = domain.answerAr;
    if (domain.sortOrder !== undefined) doc.sortOrder = domain.sortOrder;
    if (domain.isActive !== undefined) doc.isActive = domain.isActive;
    return doc;
  }
}
