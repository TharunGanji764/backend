import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ProfileDTO } from '../dto/profile.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @EventPattern('create-profile')
  async createProfile(data: ProfileDTO) {
    return await this.userServiceService.createProfile(data);
  }

  @MessagePattern('get_user_data')
  async getUserData(data: any) {
    return await this.userServiceService.getUserByEmail(data);
  }

  @MessagePattern('get_user_address')
  async getUserAddress(data: any) {
    return await this.userServiceService.getUserAddress(data);
  }

  @MessagePattern('add_user_address')
  async getAddUserAddress(data: any) {
    return await this.userServiceService.addUserAddress(data);
  }
}
