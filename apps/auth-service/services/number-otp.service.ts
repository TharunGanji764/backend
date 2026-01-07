import { Injectable } from '@nestjs/common';
import { OtpGenerator } from '../interfaces/otp-generator.interface';

@Injectable()
export class NumberOtpGenerator implements OtpGenerator {
  generate(): number {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  }
}
