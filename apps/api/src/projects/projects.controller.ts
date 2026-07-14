import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IsIn, IsString, MinLength } from 'class-validator';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import type { KeyEnv } from '../common/keys.util.js';
import { ProjectsService } from './projects.service.js';

class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

class RotateKeysDto {
  @IsIn(['live', 'test'])
  env!: KeyEnv;
}

@Controller('projects')
@UseGuards(SessionAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list(@Req() req: Request) {
    const userId = req.session.userId!;
    return this.projectsService.listForOwner(userId);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateProjectDto) {
    const userId = req.session.userId!;
    return this.projectsService.create(userId, dto.name);
  }

  @Post(':id/keys/rotate')
  async rotateKeys(@Req() req: Request, @Param('id') id: string, @Body() dto: RotateKeysDto) {
    const userId = req.session.userId!;
    return this.projectsService.rotateKeys(id, userId, dto.env);
  }
}
