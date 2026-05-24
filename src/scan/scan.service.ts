import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobProgress } from 'bullmq/dist/esm/types/job-progress';
import { spawn } from 'child_process';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/pick.js';
import { streamArray } from 'stream-json/streamers/stream-array.js';
import { ScanStatus, Status, Vulnerability } from './types';

@Injectable()
export class ScanService {
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

  scanLocalPath(path: string): Promise<Vulnerability[]> {
    return new Promise((resolve, reject) => {
      const criticalVulns: Vulnerability[] = [];
      const trivy = spawn('trivy', [
        'fs',
        '--scanners',
        'vuln',
        '--format',
        'json',
        path,
      ]);

      const pipeline = chain([
        trivy.stdout,
        parser(),
        pick({ filter: 'Results' }),
        pick({ filter: /\.(Vulnerabilities)$/ }),
        streamArray(),
      ]);
      pipeline.on('data', ({ value }: { value: Vulnerability }) => {
        if (value.Severity.toLowerCase() === 'critical') {
          criticalVulns.push(value);
        }
      });

      pipeline.on('end', () => {
        resolve(criticalVulns);
      });

      pipeline.on('error', (error) => {
        reject(error);
      });

      trivy.on('error', (error) => {
        reject(error);
      });
    });
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
  return Status.SCANNING;
}
