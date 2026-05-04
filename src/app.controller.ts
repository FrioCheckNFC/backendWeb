import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): object {
    return {
      status: 'OK',
      message: 'Servidor funcionando',
      timestamp: new Date(),
      kpisModule: 'Implementado'
    };
  }
}
