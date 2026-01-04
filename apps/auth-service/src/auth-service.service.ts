import { AccessToken } from '../lib/generateTokens';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO } from '../dto/register.dto';
import { User } from '../schemas/user.schema';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GenerateOtp } from '../lib/generateOtp';
import { ClientProxy } from '@nestjs/microservices';
import { verifyOtpDTO } from '../dto/verify-otp.dto';
import { LoginDTO } from '../dto/login.dto';

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

  async verifyOtp(userData: verifyOtpDTO) {
    const { emailId, otp, password, username, mobile } = userData;
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      emailId,
      password: hashedPassword,
      username,
      mobile,
    });
    await this.userRepository.save(newUser);
    return { message: 'User registered successfully ' };
  }

  async loginUser(userData: LoginDTO) {
    const { emailId, password } = userData;
    const isUserExist = await this.userRepository.findOne({
      where: { emailId: emailId },
    });

    if (!isUserExist) {
      throw new NotFoundException('Invalid user');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      isUserExist.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Invalid Password');
    }

    const payload = {
      sub: isUserExist.emailId,
      username: isUserExist.username,
    };
    const accessToken =
      await this.generateAccessToken.generateAccessToken(payload);
    const refreshToken =
      await this.generateAccessToken.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const payload = await this.generateAccessToken.verifyRefreshToken(token);
    const { exp, ...rest } = payload;
    const newAccessToken =
      await this.generateAccessToken.generateAccessToken(rest);
    return { accessToken: newAccessToken };
  }
}
