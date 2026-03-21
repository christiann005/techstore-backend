import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const errorBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: (exceptionResponse as any).error || 'Error',
      message: (exceptionResponse as any).message || exceptionResponse,
    };

    // Logging detallado en consola para el desarrollador (Backend)
    this.logger.error(
      `${request.method} ${request.url} [${status}]: ${JSON.stringify(errorBody.message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorBody);
  }
}
