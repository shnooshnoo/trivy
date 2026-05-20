import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('scan')
  getHello(@Body('url') url: string): Promise<string> {
    // optional arg to preserve local repo if exists?
    // should it support private repos? specific branch?
    return this.appService.startScan(url);
  }
}
