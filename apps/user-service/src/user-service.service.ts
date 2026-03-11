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
import { RpcException } from '@nestjs/microservices';
import { SellerProfile } from '../schemas/seller.entity';
import { UserRoles } from '../schemas/user-roles.entity';

@Injectable()
export class UserServiceService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(SellerProfile)
    private readonly sellerProfileRepository: Repository<SellerProfile>,
    @InjectRepository(UserRoles)
    private readonly userRolesRepository: Repository<UserRoles>,
  ) {}

  async createProfile(data: ProfileData) {
    const { emailId, username, mobile, userid, role, storeName } = data;

    if (role === 'SELLER') {
      const sellerProfile = await this.sellerProfileRepository.create({
        seller_id: userid,
        is_active: true,
        store_name: storeName,
        email_id: emailId,
      });
      await this.sellerProfileRepository.save(sellerProfile);
    } else if (role === 'CUSTOMER') {
      const userProfileData = await this.userRepository.create({
        user_id: userid,
        name: username,
        phone: mobile,
        email_id: emailId,
        role: role,
      });
      await this.userRepository.save(userProfileData);
    }

    const userRoles = await this.userRolesRepository.create({
      role: role,
      user_id: userid,
    });
    await this.userRolesRepository.save(userRoles);
  }

  async getUserByEmail(data: any) {
    const { emailId, userId } = data;
    const userRole = await this.userRolesRepository.findOne({
      where: { user_id: userId },
    });
    if (userRole?.role === 'CUSTOMER') {
      const user = await this.userRepository.findOneBy({ email_id: emailId });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } else if (userRole?.role === 'SELLER') {
      const seller = await this.sellerProfileRepository.findOneBy({
        seller_id: userId,
      });
      if (!seller) {
        throw new UnauthorizedException('Seller not found');
      }
      return seller;
    }
  }

  async getUserAddressess(data: any) {
    const { userId } = data;
    const userAddress = await this.addressRepository.find({
      where: {
        user: { user_id: userId },
      },
      select: [
        'id',
        'address_line',
        'city',
        'state',
        'pincode',
        'is_default',
        'full_name',
        'phone_number',
        'landmark',
        'tag',
      ],
      order: { id: 'ASC' },
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
      full_name: address.full_name,
      phone_number: address.phone_number,
      landmark: address.landmark,
      tag: address.tag,
      user: { user_id: userId },
    });
    await this.addressRepository.save(userAddress);
    return { message: 'Address added successfully' };
  }

  async deleteUserAddress(data: any) {
    const { addressId } = data;
    const result = await this.addressRepository.delete({ id: addressId });
    if (!result.affected) {
      throw new RpcException({
        message: 'Address Not Found',
      });
    }

    return { message: 'Address Deleted Successfully' };
  }

  async updateUserAddress(data: any) {
    const { userId, address } = data?.payload;
    const getAddress = await this.addressRepository.findOne({
      where: { id: address?.id },
    });
    if (!getAddress) {
      throw new RpcException({
        message: 'Address Not Found',
      });
    }
    const userAddressess = await this.addressRepository.findOne({
      where: { user: { user_id: userId }, is_default: true },
    });

    if (userAddressess?.is_default) {
      const previousAddress = {
        ...userAddressess,
        is_default: false,
      };
      await this.addressRepository.save(previousAddress);
    }
    const updatedAddress = await this.addressRepository.merge(
      getAddress,
      address,
    );
    await this.addressRepository.save(updatedAddress);
    return {
      message: 'Address Updated Successfully',
    };
  }
}
