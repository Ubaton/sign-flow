import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignatureEntity } from '../entities/signature.entity.js';
import { CreateSignatureDto } from './dto.js';

@Injectable()
export class SignaturesService {
  constructor(
    @InjectRepository(SignatureEntity)
    private readonly signatures: Repository<SignatureEntity>,
  ) {}

  async create(projectId: string, isTest: boolean, dto: CreateSignatureDto): Promise<SignatureEntity> {
    const record = this.signatures.create({
      ...dto,
      location: dto.location ?? null,
      projectId,
      isTest,
    });
    return this.signatures.save(record);
  }

  /** Secret keys are scoped to their own environment — a live key never sees test data and vice versa. */
  async findOne(id: string, projectId: string, isTest: boolean): Promise<SignatureEntity> {
    const record = await this.signatures.findOne({ where: { id, projectId, isTest } });
    if (!record) throw new NotFoundException('Signature not found');
    return record;
  }

  async listForProject(projectId: string, isTest: boolean): Promise<SignatureEntity[]> {
    return this.signatures.find({ where: { projectId, isTest }, order: { date: 'DESC' } });
  }

  async delete(id: string, projectId: string, isTest: boolean): Promise<void> {
    const result = await this.signatures.delete({ id, projectId, isTest });
    if (result.affected === 0) throw new NotFoundException('Signature not found');
  }
}
