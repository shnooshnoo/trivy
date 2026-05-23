import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

@Injectable()
export class AppService {
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
}
