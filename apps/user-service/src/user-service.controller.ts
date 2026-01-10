import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { EventPattern } from '@nestjs/microservices';
import { ProfileDTO } from '../dto/profile.dto';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @EventPattern('create-profile')
  async createProfile(data: ProfileDTO) {
    console.log('data: ', data);
    return await this.userServiceService.createProfile(data);
  }
}
