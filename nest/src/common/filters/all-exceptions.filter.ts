import { Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter, Logger } from '@nestjs/common';
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

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error', error: 'Internal Server Error' };

    let message = (errorResponse as any).message || errorResponse;
    if (typeof message === 'string') {
      message = [message];
    } else if (!Array.isArray(message)) {
      message = [(errorResponse as any).error || 'Internal server error'];
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`Exception: ${exception}`, (exception as any)?.stack);
    }

    response.status(status).json({
      statusCode: status,
      error: (errorResponse as any).error || (status === 401 ? 'Unauthorized' : 'Error'),
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
