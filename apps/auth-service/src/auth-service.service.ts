import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO } from '../dto/register.dto';
import { Auth } from '../schemas/auth.schema';
import { Repository } from 'typeorm';
import { verifyOtpDTO } from '../dto/verify-otp.dto';
import { LoginDTO } from '../dto/login.dto';
import type { TokenService } from '../interfaces/token-service.interface';
import type { OtpGenerator } from '../interfaces/otp-generator.interface';
import type { NotificationChannel } from '../interfaces/notification-channel.interface';
import type { Hash } from '../interfaces/hashing.interface';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectRepository(Auth)
    private userRepository: Repository<Auth>,
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
    @Inject('REDIS_TEMPORARY_USER_DB')
    private redisTemporaryUserClient: any,
    @Inject('REDIS_SESSION_MANAGE')
    private redisSessionManagement: any,
    @Inject('USER_SERVICE')
    private readonly userClient: ClientProxy,
  ) {}

  async registerUser(userData: RegisterDTO) {
    const { emailId, password, username, mobile } = userData;
    const isUserExist = await this.userRepository.findOne({
      where: { emailId: emailId },
    });

    if (isUserExist) {
      throw new ConflictException('User with this emailId already exists');
    }
    const otp = this.otpGenerator.generate();
    const hashedOtp = await this.hashService.hash(String(otp), 10);
    const hashedPassword = await this.hashService.hash(password, 10);
    const newUser = {
      userid: uuidv4(),
      emailId,
      password: hashedPassword,
      username,
      mobile,
    };
    await this.redisOtpClient.set(
      `otp:register:${emailId}`,
      hashedOtp,
      'EX',
      300,
    );
    await this.redisTemporaryUserClient.set(
      `tempuser:register:${emailId}`,
      JSON.stringify(newUser),
      'EX',
      600,
    );
    this.emailChannel.send(emailId, otp);
    return { message: 'Otp sent to your email successfully' };
  }

  async verifyOtp(userData: verifyOtpDTO) {
    const { otp, emailId } = userData;
    const user = await this.redisTemporaryUserClient.get(
      `tempuser:register:${emailId}`,
    );
    const storedHashedOtp = await this.redisOtpClient.get(
      `otp:register:${emailId}`,
    );
    if (!storedHashedOtp) {
      throw new ConflictException('OTP has expired or is invalid');
    }
    const isOtpValid = await this.hashService.compare(otp, storedHashedOtp);
    if (!isOtpValid) {
      throw new ConflictException('Invalid OTP provided');
    }
    const { password, ...rest } = JSON.parse(user);
    this.userClient.emit('create-profile', { ...rest });
    await this.userRepository.create(JSON.parse(user));
    await this.userRepository.save(JSON.parse(user));
    return { message: 'User registered successfully ' };
  }

  async loginUser(userData: LoginDTO) {
    const { emailId, password } = userData;
    const isUserExist = await this.userRepository.findOne({
      where: { emailId: emailId },
    });

    const totalSessions = await this.redisSessionManagement.keys(`sessionId:*`);
    const userSessions: any = [];

    for (const session of totalSessions) {
      const sessionData = await this.redisSessionManagement.get(session);
      const parsed = JSON.parse(sessionData);
      if (parsed?.['userId'] === isUserExist?.userid) {
        userSessions?.push(session);
      }
    }

    if (userSessions?.length >= 2) {
      throw new UnauthorizedException(
        `There are ${userSessions?.length} sessions available please logout any one to continue login`,
      );
    }

    if (!isUserExist) {
      throw new NotFoundException('Invalid user');
    }

    const isPasswordValid = await this.hashService.compare(
      password,
      isUserExist.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Invalid Password');
    }

    const sessionId = uuidv4();
    const payload = {
      sub: isUserExist.userid,
      username: isUserExist.username,
      email: isUserExist.emailId,
      sessionId,
      mobile: isUserExist?.mobile,
    };
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    const session = {
      sessionId,
      refreshToken,
      userId: isUserExist.userid,
    };
    await this.redisSessionManagement.set(
      `sessionId:${sessionId}`,
      JSON.stringify(session),
      'EX',
      7 * 24 * 60 * 60,
    );

    return { accessToken, refreshToken, ...payload };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const payload = await this.tokenService.verifyRefreshToken(token);
    const { exp, iat, ...rest } = payload;
    const isSessionAvailable = await this.redisSessionManagement.get(
      `sessionId:${rest?.sessionId}`,
    );
    if (!isSessionAvailable) {
      throw new UnauthorizedException('Token Invalid');
    }
    const newAccessToken = await this.tokenService.generateAccessToken(rest);
    return { accessToken: newAccessToken };
  }

  async logout(userId: string, sessionId: string) {
    const session = await this.redisSessionManagement.del(
      `sessionId:${sessionId}`,
    );

    return { session };
  }
}
