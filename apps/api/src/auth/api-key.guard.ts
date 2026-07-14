import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from '../projects/projects.service.js';

export const PROJECT_REQUEST_KEY = 'signPkgProject';
export const IS_TEST_KEY_REQUEST_KEY = 'signPkgIsTestKey';

function extractKey(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);
  return null;
}

/** Scopes a request to a project via its public key (client-submittable). */
@Injectable()
export class PublicKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const key = extractKey(req);
    if (!key || !key.startsWith('pk_')) throw new UnauthorizedException('Missing or invalid public key');

    const project = await this.projectsService.findByPublicKey(key);
    if (!project) throw new UnauthorizedException('Unknown public key');

    const reqRecord = req as Request & Record<string, unknown>;
    reqRecord[PROJECT_REQUEST_KEY] = project;
    reqRecord[IS_TEST_KEY_REQUEST_KEY] = key.startsWith('pk_test_');
    return true;
  }
}

/** Scopes a request to a project via its secret key (server-only). */
@Injectable()
export class SecretKeyGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const key = extractKey(req);
    if (!key || !key.startsWith('sk_')) throw new UnauthorizedException('Missing or invalid secret key');

    const project = await this.projectsService.findBySecretKey(key);
    if (!project) throw new UnauthorizedException('Unknown secret key');

    const reqRecord = req as Request & Record<string, unknown>;
    reqRecord[PROJECT_REQUEST_KEY] = project;
    reqRecord[IS_TEST_KEY_REQUEST_KEY] = key.startsWith('sk_test_');
    return true;
  }
}
