// http-exception.filter.ts
import { Catch, HttpException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Catch(HttpException)
export class HttpExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    let ctx = host.switchToHttp();
    let response = ctx.getResponse<Response>();
    let request = ctx.getRequest<Request>();
    let status = exception.getStatus();

    this.logger.error(
      `HTTP Exception: ${exception.getResponse()}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exception.getResponse(),
    });
  }
}
