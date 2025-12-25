import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new BadRequestException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Invalid authorization format');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      console.log('payload: ', payload);
      request.user = payload;
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
