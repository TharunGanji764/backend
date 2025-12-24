import { Injectable } from '@nestjs/common';

@Injectable()
export class GenerateOtp {
  generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  }
}
