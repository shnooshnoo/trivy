import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScanProcessor } from './scan.processor';
import { ScanStatusService } from './scan-status.service';
import { GitModule } from '../git/git.module';
import { AppService } from '../app.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scan',
    }),
    GitModule,
  ],
  providers: [ScanProcessor, ScanStatusService, AppService],
  exports: [BullModule, ScanStatusService],
})
export class ScanModule {}
