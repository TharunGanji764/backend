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
import { verifyOtpDTO } from '../dto/verify-otp.dto';
import { LoginDTO } from '../dto/login.dto';
import type { TokenService } from '../interfaces/token-service.interface';
import type { OtpGenerator } from '../interfaces/otp-generator.interface';
import type { NotificationChannel } from '../interfaces/notification-channel.interface';
import type { Hash } from '../interfaces/hashing.interface';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('REDIS_OTP_DB')
    private redisOtpClient: any,
    @Inject('TokenService')
    private readonly tokenService: TokenService,
    @Inject('otpGenerator')
    private readonly otpGenerator: OtpGenerator,
    @Inject('NotificationChannel')
    private readonly emailChannel: NotificationChannel,
    @Inject('HashService')
    private readonly hashService: Hash,
  ) {}

  async registerUser(userData: RegisterDTO) {
    const { emailId } = userData;
    const isUserExist = await this.userRepository.findOne({
      where: { emailId: emailId },
    });

    if (isUserExist) {
      throw new ConflictException('User with this emailId already exists');
    }
    const otp = this.otpGenerator.generate();
    this.emailChannel.send(emailId, otp);
    const hashedOtp = await this.hashService.hash(String(otp), 10);
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
    const isOtpValid =await this.hashService.compare(otp, storedHashedOtp);
    if (!isOtpValid) {
      throw new ConflictException('Invalid OTP provided');
    }
    const hashedPassword = await this.hashService.hash(password, 10);
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

    console.log('isUserExist: ', isUserExist);
    if (!isUserExist) {
      throw new NotFoundException('Invalid user');
    }

    const isPasswordValid = await this.hashService.compare(
      password,
      isUserExist.password,
    );
    console.log('isPasswordValid: ', isPasswordValid);

    if (!isPasswordValid) {
      throw new ConflictException('Invalid Password');
    }

    const payload = {
      sub: isUserExist.emailId,
      username: isUserExist.username,
    };
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const payload = await this.tokenService.verifyRefreshToken(token);
    const { exp, ...rest } = payload;
    const newAccessToken = await this.tokenService.generateAccessToken(rest);
    return { accessToken: newAccessToken };
  }
}
