import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductServiceService {
  getHello(): string {
    return 'Hello World!';
  }

  async getProducts() {
    return { message: 'this is products service' };
  }
}
