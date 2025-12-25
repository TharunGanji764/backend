import { Body, Controller, Get, HttpException, Post, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RegisterDTO } from '../dto/register.dto';
import { verifyOtpDTO } from '../dto/verify-otp.dto';
import { LoginDTO } from '../dto/login.dto';
import { AuthGuard } from '../lib/authguard';

@Controller('auth')
export class ApiGatewayController {
  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  async register(@Body() body: RegisterDTO) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.NEXT_PUBLIC_API_AUTH_URL}/auth/register`,
          body,
        ),
      );

      return response.data;
    } catch (err) {
      throw new HttpException(
        err.response?.data?.message || 'Auth service error',
        err.response?.status || 500,
      );
    }
  }
  @Post('verify-otp')
  async verifyOtp(@Body() body: verifyOtpDTO) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.NEXT_PUBLIC_API_AUTH_URL}/auth/verify-otp`,
          body,
        ),
      );

      return response.data;
    } catch (err) {
      throw new HttpException(
        err.response?.data?.message || 'Auth service error',
        err.response?.status || 500,
      );
    }
  }

  @Post('login')
  async login(@Body() userData: LoginDTO) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${process.env.NEXT_PUBLIC_API_AUTH_URL}/auth/login`,
          userData,
        ),
      );
      return response.data;
    } catch (err) {
      throw new HttpException(
        err.response?.data?.message || 'Auth service error',
        err.response?.status || 500,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('test')
  async test() {
    return 'Auth Service is working fine';
  }
}
