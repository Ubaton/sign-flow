import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';
import { GithubStrategy } from './github.strategy.js';
import { GoogleStrategy } from './google.strategy.js';
import { PublicKeyGuard, SecretKeyGuard } from './api-key.guard.js';

@Module({
  imports: [PassportModule.register({ session: true }), UsersModule, ProjectsModule],
  controllers: [AuthController, MeController],
  providers: [GithubStrategy, GoogleStrategy, PublicKeyGuard, SecretKeyGuard],
  exports: [PublicKeyGuard, SecretKeyGuard, ProjectsModule],
})
export class AuthModule {}
