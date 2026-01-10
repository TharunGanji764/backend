import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddressDto } from 'apps/api-gateway/dto/address.dto';

@Injectable()
export class UserGatewayService {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  async getUsers(user: any) {
    return await this.userClient.send('get_user_data', {
      userId: user.sub,
      emailId: user.emailId,
    });
  }

  async getUserAddress(user: any) {
    return await this.userClient.send('get_user_address', {
      userId: user.sub,
      emailId: user.email,
    });
  }

  async addUserAddress(user: any, address: AddressDto) {
    return await this.userClient.send('add_user_address', {
      userId: user.sub,
      address,
    });
  }
}
