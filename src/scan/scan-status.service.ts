import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ScanStatus, Status } from './types';
import { JobProgress } from 'bullmq/dist/esm/types/job-progress';

@Injectable()
export class ScanStatusService {
  constructor(
    @InjectQueue('scan')
    private scanQueue: Queue<{ url: string }, { result: string }>,
  ) {}

  async createScan(url: string): Promise<{ scanId: string; status: Status }> {
    const job = await this.scanQueue.add('analyze', { url });

    if (!job.id) {
      // investigate what may cause a missing id. A better workaround may be possible
      throw new InternalServerErrorException('Failed to create scan.');
    }

    return {
      scanId: job.id,
      status: Status.QUEUED,
    };
  }

  async getScanStatus(scanId: string): Promise<ScanStatus> {
    const job = await this.scanQueue.getJob(scanId);

    if (!job) {
      throw new NotFoundException(`Scan with id ${scanId} not found`);
    }

    const state = await job.getState();

    if (state === 'completed') {
      const result = job.returnvalue;
      return {
        scanId,
        status: Status.COMPLETED,
        result: result?.result,
      };
    }

    if (state === 'failed') {
      return {
        scanId,
        status: Status.FAILED,
        error: job.failedReason,
      };
    }

    return {
      scanId,
      status: getStatusByProgress(job.progress),
    };
  }
}

function getStatusByProgress(progress: JobProgress): Status {
  if (typeof progress !== 'number' || progress < 30) {
    return Status.QUEUED;
  }
  if (progress < 60) {
    return Status.CLONING;
  }
  return Status.ANALYZING;
}
