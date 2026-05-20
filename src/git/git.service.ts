import { BadRequestException, Injectable } from '@nestjs/common';
import simpleGit from 'simple-git';
import fs from 'fs';

@Injectable()
export class GitService {
  async cloneRepo(url: string) {
    const path = this.validateGitHubUrlAndGetPath(url);
    fs.rmSync(path, { recursive: true, force: true });
    // simpleGit adds overhead as it clones a repo with git metadata, history, etc.
    // consider a more straightforward alternative that would only download source files
    // TODO measure cpu/memory consumption with a big repo like https://github.com/torvalds/linux
    await simpleGit().clone(url, path, ['--depth', '1']);
    return path;
  }

  private validateGitHubUrlAndGetPath(url: string): string {
    if (!url) {
      throw new BadRequestException('Github repo URL is required');
    }

    const parsedUrl = new URL(url);

    if (parsedUrl.hostname !== 'github.com') {
      throw new BadRequestException('Github repo URL is required');
    }

    return './repos' + parsedUrl.pathname.replace(/\/$/, '');
  }
}
