import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SessionAuthGuard } from './session-auth.guard.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async me(@Req() req: Request) {
    const user = await this.usersService.findById(req.session.userId!);
    return { id: user!.id, email: user!.email, provider: user!.provider };
  }
}
