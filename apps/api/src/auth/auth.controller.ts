import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { UserEntity } from '../entities/user.entity.js';

@Controller('auth/oauth')
export class AuthController {
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    // Redirect to GitHub is handled by AuthGuard.
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.completeLogin(req, res);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Redirect to Google is handled by AuthGuard.
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.completeLogin(req, res);
  }

  private completeLogin(req: Request, res: Response) {
    const user = req.user as UserEntity;
    req.session.userId = user.id;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    res.redirect(process.env.POST_LOGIN_REDIRECT ?? `${frontendUrl}/dashboard`);
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    req.session.destroy(() => res.redirect(frontendUrl));
  }
}
