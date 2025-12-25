import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccessToken {
  constructor(private JwtService: JwtService) {}
  generateAccessToken(payload: any) {
    return this.JwtService.signAsync(payload);
  }
}
