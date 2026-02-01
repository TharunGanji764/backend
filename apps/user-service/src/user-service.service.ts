import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileData } from '../types/profile.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../schemas/user-schema';
import { Repository } from 'typeorm';
import { Address } from '../schemas/adress.schema';
import { AddressType } from '../types/address.type';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
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

  async getUserByEmail(data: any) {
    const { userId } = data;
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async getUserAddressess(data: any) {
    const { userId } = data;
    const userAddress = await this.addressRepository.find({
      where: {
        user: { user_id: userId },
      },
    });
    if (!userAddress) {
      throw new NotFoundException('Addressess not found');
    }
    return userAddress;
  }

  async addUserAddress({
    userId,
    address,
  }: {
    userId: string;
    address: AddressType;
  }) {
    const userAddress = await this.addressRepository.create({
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode.toString(),
      is_default: address.is_default,
      user: { user_id: userId },
    });
    await this.addressRepository.save(userAddress);
    return { message: 'Address added successfully' };
  }
}
