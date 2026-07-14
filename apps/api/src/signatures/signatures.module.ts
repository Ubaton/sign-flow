import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignatureEntity } from '../entities/signature.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { SignaturesController } from './signatures.controller.js';
import { SignaturesService } from './signatures.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SignatureEntity]), AuthModule],
  controllers: [SignaturesController],
  providers: [SignaturesService],
})
export class SignaturesModule {}
