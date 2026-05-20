import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { GitService } from './git/git.service';
import { exec } from 'node:child_process';

@Injectable()
export class AppService {
  constructor(private readonly gitService: GitService) {}

  async startScan(url: string) {
    const localPath = await this.gitService.cloneRepo(url);
    const memBefore = process.memoryUsage();
    await this.analyzeLocalPath(localPath);
    // await this.analyzeLocalPathDummyJsonExec(500);
    const memAfter = process.memoryUsage();

    console.log('Memory Delta (MB):', {
      heapUsed: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024,
      rss: (memAfter.rss - memBefore.rss) / 1024 / 1024,
    });
    return 'ok';
  }

  analyzeLocalPath(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFile = 'full-scan.json';
      const trivy = spawn('trivy', [
        'fs',
        '--scanners',
        'vuln,secret,config,license',
        '--format',
        'json',
        path,
      ]);

      const writeStream = createWriteStream(outputFile);

      // Stream stdout directly to file
      trivy.stdout.pipe(writeStream);

      trivy.on('close', (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`Trivy exited with code ${code}`));
        }
      });

      trivy.on('error', (err) => {
        reject(err);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  analyzeLocalPathDummyJson(sizeMB: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFile = 'full-scan.json';
      const trivy = spawn('node', [
        '-e',
        `
  const size = ${sizeMB} * 1024 * 1024; // 500MB
  let written = 0;
  process.stdout.write('{"results":[');
  while (written < size) {
    const obj = {
      id: Math.random().toString(36),
      data: 'x'.repeat(1000),
      vulnerabilities: Array(10).fill({severity: 'HIGH', desc: 'test'})
    };
    const chunk = (written > 0 ? ',' : '') + JSON.stringify(obj);
    process.stdout.write(chunk);
    written += chunk.length;
  }
  process.stdout.write(']}');
  `,
      ]);

      const writeStream = createWriteStream(outputFile);

      // Stream stdout directly to file
      trivy.stdout.pipe(writeStream);

      trivy.on('close', (code) => {
        if (code === 0) {
          resolve(outputFile);
        } else {
          reject(new Error(`Trivy exited with code ${code}`));
        }
      });

      trivy.on('error', (err) => {
        reject(err);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  analyzeLocalPathDummyJsonExec(sizeMB: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFile = 'full-scan-exec.json';
      const command = `node -e "
        const size = ${sizeMB} * 1024 * 1024; // 500MB
        let written = 0;
        process.stdout.write('{"results":[');
        while (written < size) {
          const obj = {
            id: Math.random().toString(36),
            data: 'x'.repeat(1000),
            vulnerabilities: Array(10).fill({severity: 'HIGH', desc: 'test'})
          };
          const chunk = (written > 0 ? ',' : '') + JSON.stringify(obj);
          process.stdout.write(chunk);
          written += chunk.length;
        }
        process.stdout.write(']}');
      "`;

      exec(command, { maxBuffer: 1024 * 1024 * 1024 }, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const writeStream = createWriteStream(outputFile);
        writeStream.write(stdout);
        writeStream.end();

        writeStream.on('finish', () => resolve(outputFile));
        writeStream.on('error', reject);
      });
    });
  }
}
