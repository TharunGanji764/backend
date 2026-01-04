import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccessToken {
  constructor(
    private JwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  generateAccessToken(payload: any) {
    return this.JwtService.signAsync(payload, { expiresIn: '2h' });
  }

  generateRefreshToken(payload: any) {
    return this.JwtService.signAsync(payload, { expiresIn: '7d' });
  }

  verifyRefreshToken(token: string) {
    return this.JwtService.verifyAsync(token, {
      publicKey: (
        this.configService.get<string>('TOKEN_PUBLIC_KEY') ?? ''
      ).replace(/\\n/g, '\n'),
      algorithms: ['RS256'],
    });
  }
}
