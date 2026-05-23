import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScanStatusService } from './scan/scan-status.service';

@Controller('api')
export class AppController {
  constructor(private readonly scanStatusService: ScanStatusService) {}

  @Post('scan')
  async startScan(
    @Body('url') url: string,
  ): Promise<{ scanId: string; status: string }> {
    // optional arg to preserve local repo if exists?
    // should it support private repos? specific branch?
    return this.scanStatusService.createScan(url);
  }

  @Get('scan/:scanId')
  async getScanStatus(@Param('scanId') scanId: string) {
    return this.scanStatusService.getScanStatus(scanId);
  }
}
