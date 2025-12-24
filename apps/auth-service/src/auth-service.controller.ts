import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { RegisterDTO } from '../dto/register.dto';
import { AuthGuard } from '../lib/authGuard';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  async register(@Body() userData: RegisterDTO) {
    return this.authServiceService.registerUser(userData);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { emailId: string; otp: string }) {
    return this.authServiceService.verifyOtp(body.emailId, body.otp);
  }
}
