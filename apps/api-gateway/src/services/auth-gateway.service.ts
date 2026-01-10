import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
