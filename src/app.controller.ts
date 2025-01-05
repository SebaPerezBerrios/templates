import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtUserGuard, Roles } from './shared/utils/guards';

@JwtUserGuard()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Roles('service.list')
  getHello(): string {
    return this.appService.getHello();
  }
}
