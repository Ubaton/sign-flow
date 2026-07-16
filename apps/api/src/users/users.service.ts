import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthProvider, UserEntity } from '../entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  /** Finds the user for this OAuth identity, creating one on first login. */
  async findOrCreateFromOAuth(params: {
    email: string;
    name: string | null;
    provider: OAuthProvider;
    providerId: string;
  }): Promise<UserEntity> {
    const existing = await this.users.findOne({
      where: { provider: params.provider, providerId: params.providerId },
    });
    if (existing) {
      // Backfill the name for accounts created before we captured it.
      if (!existing.name && params.name) {
        existing.name = params.name;
        return this.users.save(existing);
      }
      return existing;
    }

    const user = this.users.create(params);
    return this.users.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { id } });
  }
}
