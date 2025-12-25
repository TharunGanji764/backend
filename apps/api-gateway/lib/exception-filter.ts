import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';

@Catch()
export class ApiGatewayExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof RpcException) {
      const error = exception.getError() as any;
      return response.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }

    if (exception instanceof AxiosError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service temporarily unavailable',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json({
        success: false,
        message: exception.message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
