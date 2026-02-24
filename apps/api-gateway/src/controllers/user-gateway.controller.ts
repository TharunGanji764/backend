import { UserGatewayService } from './../services/user-gateway.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'apps/api-gateway/lib/authguard';
import { User } from '../decorators/user.decorator';
import { AddressDto } from 'apps/api-gateway/dto/address.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UserGatewayController {
  constructor(private readonly UserGatewayService: UserGatewayService) {}

  @Get('/profile')
  async getUsers(@User() user: any) {
    return await this.UserGatewayService.getUsers(user);
  }

  @Get('/get-address')
  async getUserAddress(@User() user: any) {
    return await this.UserGatewayService.getUserAddress(user);
  }

  @Post('/add-address')
  async addUserAddress(@User() user: any, @Body() address: AddressDto) {
    return await this.UserGatewayService.addUserAddress(user, address);
  }

  @Delete('/delete-address')
  async deleteUserAddress(@Body() addressId: any) {
    return await this.UserGatewayService.deleteUserAddress(addressId);
  }

  @Put('/update-address')
  async updateUserAddress(
    @User() user: any,
    @Body() address: AddressDto & { id: number },
  ) {
    const { sub: userId } = user;
    const payload = {
      address,
      userId,
    };
    return await this.UserGatewayService.updateUserAddress({ payload });
  }
}
