import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { AxiosError } from 'axios';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch()
export class ApiGatewayExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof RpcException) {
      const error = exception.getError() as any;
      return response.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal service error',
      });
    }

    if (exception instanceof AxiosError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service temporarily unavailable',
      });
    }

    if (
      exception instanceof JsonWebTokenError ||
      exception instanceof TokenExpiredError
    ) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseData = exception.getResponse();

      return response.status(status).json({
        success: false,
        message:
          typeof responseData === 'string'
            ? responseData
            : (responseData as any)?.message || exception.message,
      });
    }

    return response.status(exception?.status).json({
      success: false,
      message: exception,
    });
  }
}
