import { Injectable } from '@nestjs/common';
import { ProfileData } from '../types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../schemas/user-schema';
import { Repository } from 'typeorm';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async createProfile(data: ProfileData) {
    const { emailId, username, mobile, userid } = data;
    const userProfileData = await this.userRepository.create({
      user_id: userid,
      name: username,
      phone: mobile,
      email_id: emailId,
    });
    await this.userRepository.save(userProfileData);
  }
}
