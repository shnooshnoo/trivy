import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { GitService } from '../git/git.service';
import { AppService } from '../app.service';

export interface ScanJob {
  scanId: number;
  url: string;
}

@Processor('scan')
@Injectable()
export class ScanProcessor extends WorkerHost {
  constructor(
    private readonly gitService: GitService,
    private readonly appService: AppService,
  ) {
    super();
  }

  async process(job: Job<ScanJob>) {
    const { url } = job.data;
    await job.updateProgress(30);

    const localPath = await this.gitService.cloneRepo(url);
    await job.updateProgress(60);

    const result = await this.appService.analyzeLocalPath(localPath);
    await job.updateProgress(100);
    this.gitService.cleanUpRepo(url);
    return { scanId: job.id, result };
  }
}
