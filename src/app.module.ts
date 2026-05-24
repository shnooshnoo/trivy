import { Module } from '@nestjs/common';
import { GitModule } from './git/git.module';
import { BullModule } from '@nestjs/bullmq';
import { ScanModule } from './scan/scan.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    GitModule,
    ScanModule,
  ],
})
export class AppModule {}
