import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RegisterDTO } from '../dto/register.dto';

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
  async verifyOtp(@Body() body: { emailId: string; otp: string }) {
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
}
