import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DataSource,
  EntityTarget,
  EntityManager,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import * as crypto from 'crypto';

export enum CodePrefix {
  PATIENT = 'PAT',
  DOCTOR = 'DOC',
  FLAG = 'FLG',
}

export interface GenerateCodeOptions<T extends ObjectLiteral> {
  entity: EntityTarget<T>;
  columnName: keyof T & string;
  prefix: CodePrefix | string;
  payloadLength?: number;
  manager?: EntityManager;
}

@Injectable()
export class CodeGeneratorService {
  private readonly charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  constructor(private readonly dataSource: DataSource) {}

  async generateUniqueCode<T extends ObjectLiteral>(
    options: GenerateCodeOptions<T>,
  ): Promise<string> {
    const { entity, columnName, prefix, payloadLength = 5, manager } = options;

    const repository = manager
      ? manager.getRepository(entity)
      : this.dataSource.getRepository(entity);

    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const payload = this.generateRandomPayload(payloadLength);
      const fullCode = `${prefix}-${payload}`;

      const existing = await repository.findOne({
        where: { [columnName]: fullCode } as FindOptionsWhere<T>,
      });

      if (!existing) {
        return fullCode;
      }
    }

    throw new InternalServerErrorException(
      `Failed to generate a unique ${prefix} code after ${maxAttempts} attempts.`,
    );
  }

  private generateRandomPayload(length: number): string {
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += this.charset[randomBytes[i] % this.charset.length];
    }

    return result;
  }
}
