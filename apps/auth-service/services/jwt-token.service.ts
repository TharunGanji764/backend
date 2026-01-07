import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { TokenService } from '../interfaces/token-service.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: '2h' });
  }

  async generateRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      publicKey: (
        this.configService.get<string>('TOKEN_PUBLIC_KEY') ?? ''
      ).replace(/\\n/g, '\n'),
      algorithms: ['RS256'],
    });
  }
}
