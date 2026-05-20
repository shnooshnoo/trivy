import { Injectable } from '@nestjs/common';
import { GitService } from './git/git.service';

@Injectable()
export class AppService {
  constructor(private readonly gitService: GitService) {}

  async startScan(url: string) {
    await this.gitService.cloneRepo(url);
    return 'ok';
  }
}
