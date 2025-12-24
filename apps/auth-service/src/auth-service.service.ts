import { AccessToken } from './../lib/generateAccessToken';
import { InjectRepository } from '@nestjs/typeorm';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { RegisterDTO } from '../dto/register.dto';
import { User } from '../schemas/user.schema';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GenerateOtp } from '../lib/generateOtp';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private generateOtp: GenerateOtp,
    @Inject('NOTIFICATION_SERVICE')
    private clientProxy: ClientProxy,
    @Inject('REDIS_OTP_DB')
    private redisOtpClient: any,
    private generateAccessToken: AccessToken,
  ) {}

  async registerUser(userData: RegisterDTO) {
    const { emailId } = userData;
    const isUserExist = await this.userRepository.findOne({
      where: { emailId: emailId },
    });

    if (isUserExist) {
      throw new ConflictException('User with this emailId already exists');
    }
    const otp = this.generateOtp.generateOtp();
    this.clientProxy.emit('send-otp-email', { email: emailId, otp: otp });
    const hashedOtp = await bcrypt.hash(String(otp), 10);
    await this.redisOtpClient.set(
      `otp:register:${emailId}`,
      hashedOtp,
      'EX',
      300,
    );

    return { message: 'Otp sent to your email successfully' };
  }

  async verifyOtp(emailId: string, otp: string) {
    const storedHashedOtp = await this.redisOtpClient.get(
      `otp:register:${emailId}`,
    );
    if (!storedHashedOtp) {
      throw new ConflictException('OTP has expired or is invalid');
    }
    const isOtpValid = await bcrypt.compareSync(otp, storedHashedOtp);
    if (!isOtpValid) {
      throw new ConflictException('Invalid OTP provided');
    }
    const accessToken = this.generateAccessToken.generateAccessToken({
      emailId,
    });

    return { accessToken };
  }
}
