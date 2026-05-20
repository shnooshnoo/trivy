import { BadRequestException, Injectable } from '@nestjs/common';
import simpleGit from 'simple-git';
import fs from 'fs';

@Injectable()
export class GitService {
  cloneRepo(url: string) {
    // simpleGit adds overhead as it clones a repo with git metadata, history, etc.
    // consider a more straightforward alternative that would only download source files
    return simpleGit().clone(url, this.validateGitHubUrlAndGetPath(url));
  }

  private validateGitHubUrlAndGetPath(url: string): string {
    if (!url) {
      throw new BadRequestException('Github repo URL is required');
    }

    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== 'github.com') {
      throw new BadRequestException('Github repo URL is required');
    }

    const path = './repos' + parsedUrl.pathname.replace(/\/$/, '');
    fs.rmSync(path, { recursive: true, force: true });
    return path;
  }
}
