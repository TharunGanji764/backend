import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { RegisterDTO } from '../dto/register.dto';
import { verifyOtpDTO } from '../dto/verify-otp.dto';
import { LoginDTO } from '../dto/login.dto';

@Controller('auth')
export class AuthServiceController {
  constructor(private readonly authServiceService: AuthServiceService) {}

  @Post('register')
  async register(@Body() userData: RegisterDTO) {
    return await this.authServiceService.registerUser(userData);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() UserData: verifyOtpDTO) {
    return await this.authServiceService.verifyOtp(UserData);
  }

  @Post('login')
  async login(@Body() userData: LoginDTO) {
    return await this.authServiceService.loginUser(userData);
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return await this.authServiceService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Body() body: { userId: string; sessionId: string }) {
    const { userId, sessionId } = body;
    return await this.authServiceService.logout(userId, sessionId);
  }
}
