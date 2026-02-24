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

  @MessagePattern('get_user_addressess')
  async getUserAddressess(data: any) {
    return await this.userServiceService.getUserAddressess(data);
  }

  @MessagePattern('add_user_address')
  async getAddUserAddress(data: any) {
    return await this.userServiceService.addUserAddress(data);
  }

  @MessagePattern('delete_user_adress')
  async deleteUserAddress(data: any) {
    return await this.userServiceService.deleteUserAddress(data);
  }

  @MessagePattern('update_user_address')
  async updateUserAddress(data: any) {
    return await this.userServiceService.updateUserAddress(data);
  }
}
