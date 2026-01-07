import { Injectable } from '@nestjs/common';
import { Hash } from '../interfaces/hashing.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService implements Hash {
  constructor() {}
  async hash(key: any, saltRounds: number): Promise<string> {
    return await bcrypt.hash(key, saltRounds);
  }

  async compare(key: string, hashedKey: string): Promise<boolean> {
    return await bcrypt.compare(key, hashedKey);
  }
}
