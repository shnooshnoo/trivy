import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/pick.js';
import { streamArray } from 'stream-json/streamers/stream-array.js';
import { Vulnerability } from './scan/types';

@Injectable()
export class AppService {
  analyzeLocalPath(path: string): Promise<Vulnerability[]> {
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
}
