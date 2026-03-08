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
        status: error?.status,
      });
    }

    if (exception instanceof AxiosError) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service temporarily unavailable',
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (
      exception instanceof JsonWebTokenError ||
      exception instanceof TokenExpiredError
    ) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid or expired token',
        status: HttpStatus?.UNAUTHORIZED,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseData = exception.getResponse() as HttpException['response'];

      return response.status(status).json({
        success: false,
        message:
          typeof responseData === 'string'
            ? responseData
            : responseData?.message || exception.message,
        status: responseData?.statusCode,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: exception,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
