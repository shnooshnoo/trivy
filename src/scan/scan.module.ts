import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScanProcessor } from './scan.processor';
import { ScanService } from './scan.service';
import { GitModule } from '../git/git.module';
import { ScanController } from './scan.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scan',
    }),
    GitModule,
  ],
  providers: [ScanProcessor, ScanService],
  controllers: [ScanController],
  exports: [BullModule, ScanService],
})
export class ScanModule {}
