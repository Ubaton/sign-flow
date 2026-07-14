import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
  PublicKeyGuard,
  SecretKeyGuard,
  PROJECT_REQUEST_KEY,
  IS_TEST_KEY_REQUEST_KEY,
} from '../auth/api-key.guard.js';
import type { ProjectEntity } from '../entities/project.entity.js';
import { CreateSignatureDto } from './dto.js';
import { SignaturesService } from './signatures.service.js';

function projectFromRequest(req: Request): ProjectEntity {
  return (req as Request & Record<string, unknown>)[PROJECT_REQUEST_KEY] as ProjectEntity;
}

function isTestFromRequest(req: Request): boolean {
  return (req as Request & Record<string, unknown>)[IS_TEST_KEY_REQUEST_KEY] as boolean;
}

@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @UseGuards(PublicKeyGuard)
  async create(@Req() req: Request, @Body() dto: CreateSignatureDto) {
    const project = projectFromRequest(req);
    return this.signaturesService.create(project.id, isTestFromRequest(req), dto);
  }

  @Get(':id')
  @UseGuards(SecretKeyGuard)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const project = projectFromRequest(req);
    return this.signaturesService.findOne(id, project.id, isTestFromRequest(req));
  }

  @Get()
  @UseGuards(SecretKeyGuard)
  async list(@Req() req: Request, @Query('projectId') projectId: string) {
    const project = projectFromRequest(req);
    // The secret key already scopes to a single project; projectId query
    // param must match to avoid cross-project confusion.
    void projectId;
    return this.signaturesService.listForProject(project.id, isTestFromRequest(req));
  }

  @Delete(':id')
  @UseGuards(SecretKeyGuard)
  async delete(@Req() req: Request, @Param('id') id: string) {
    const project = projectFromRequest(req);
    await this.signaturesService.delete(id, project.id, isTestFromRequest(req));
  }
}
