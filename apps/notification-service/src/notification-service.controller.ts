import { Controller, Get } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
  ) {}

  @EventPattern('send-otp-email')
  sendOtpEmail(data: { email: string; otp: number }) {
    this.notificationServiceService.sendOtpToEmail(data.email, data.otp);
  }
}
