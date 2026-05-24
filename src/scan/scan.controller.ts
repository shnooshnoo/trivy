import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScanService } from './scan.service';

@Controller('api/scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('')
  async startScan(
    @Body('url') url: string,
  ): Promise<{ scanId: string; status: string }> {
    // optional arg to preserve local repo if exists?
    // should it support private repos? specific branch?
    return this.scanService.createScan(url);
  }

  @Get('/:scanId')
  async getScanStatus(@Param('scanId') scanId: string) {
    return this.scanService.getScanStatus(scanId);
  }
}
