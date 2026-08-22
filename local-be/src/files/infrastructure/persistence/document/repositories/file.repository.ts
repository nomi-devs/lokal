import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FileType } from '../../../../domain/file';
import { FileRepository } from '../../file.repository';
import { FileSchemaClass, FileSchemaDocument } from '../entities/file.schema';
import { FileMapper } from '../mappers/file.mapper';

@Injectable()
export class FilesDocumentRepository implements FileRepository {
  constructor(
    @InjectModel(FileSchemaClass.name)
    private readonly fileModel: Model<FileSchemaDocument>,
  ) {}

  async create(data: Omit<FileType, 'id' | 'createdAt'>): Promise<FileType> {
    const created = await this.fileModel.create(FileMapper.toPersistence(data));
    return FileMapper.toDomain(created);
  }

  async findById(id: string): Promise<NullableType<FileType>> {
    const found = await this.fileModel.findById(id);
    return found ? FileMapper.toDomain(found) : null;
  }

  async findByIds(ids: string[]): Promise<FileType[]> {
    const found = await this.fileModel.find({ _id: { $in: ids } });
    return found.map((f) => FileMapper.toDomain(f));
  }
}
