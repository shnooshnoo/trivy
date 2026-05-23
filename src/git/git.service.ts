import { BadRequestException, Injectable } from '@nestjs/common';
import simpleGit from 'simple-git';
import fs from 'fs';

@Injectable()
export class GitService {
  async cloneRepo(url: string) {
    const path = this.validateGitHubUrlAndGetPath(url);
    this.cleanUpRepo(url);
    await simpleGit().clone(url, path, ['--depth', '1']);
    return path;
  }

  public cleanUpRepo(url: string) {
    const path = this.validateGitHubUrlAndGetPath(url);
    fs.rmSync(path, { recursive: true, force: true });
  }

  private validateGitHubUrlAndGetPath(url: string): string {
    if (!url) {
      throw new BadRequestException('Github repo URL is required');
    }

    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== 'github.com') {
      throw new BadRequestException('Github repo URL is required');
    }

    return (
      './repos/' + parsedUrl.pathname.replace(/^\/|\/$/g, '').replace('/', '_')
    );
  }
}
