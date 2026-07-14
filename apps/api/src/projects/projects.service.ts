import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../entities/project.entity.js';
import { generatePublicKey, generateSecretKey, KeyEnv } from '../common/keys.util.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projects: Repository<ProjectEntity>,
  ) {}

  async create(ownerId: string, name: string): Promise<ProjectEntity> {
    const project = this.projects.create({
      name,
      ownerId,
      publicKey: generatePublicKey('live'),
      secretKey: generateSecretKey('live'),
      testPublicKey: generatePublicKey('test'),
      testSecretKey: generateSecretKey('test'),
    });
    return this.projects.save(project);
  }

  async listForOwner(ownerId: string): Promise<ProjectEntity[]> {
    return this.projects.find({ where: { ownerId } });
  }

  /** Rotates only the key pair for the given environment, leaving the other untouched. */
  async rotateKeys(projectId: string, ownerId: string, env: KeyEnv): Promise<ProjectEntity> {
    const project = await this.projects.findOne({ where: { id: projectId, ownerId } });
    if (!project) throw new NotFoundException('Project not found');

    if (env === 'test') {
      project.testPublicKey = generatePublicKey('test');
      project.testSecretKey = generateSecretKey('test');
    } else {
      project.publicKey = generatePublicKey('live');
      project.secretKey = generateSecretKey('live');
    }
    return this.projects.save(project);
  }

  async findByPublicKey(publicKey: string): Promise<ProjectEntity | null> {
    return this.projects.findOne({
      where: [{ publicKey }, { testPublicKey: publicKey }],
    });
  }

  async findBySecretKey(secretKey: string): Promise<ProjectEntity | null> {
    return this.projects.findOne({
      where: [{ secretKey }, { testSecretKey: secretKey }],
    });
  }
}
