import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const gitDir = join(rootDir, '.git');
const huskyDir = join(rootDir, '.husky');
const huskyInternalDir = join(huskyDir, '_');
const gitExecutable = 'C:\\Program Files\\Git\\cmd\\git.exe';
const hookNames = [
  'pre-commit',
  'pre-merge-commit',
  'prepare-commit-msg',
  'commit-msg',
  'post-commit',
  'applypatch-msg',
  'pre-applypatch',
  'post-applypatch',
  'pre-rebase',
  'post-rewrite',
  'post-checkout',
  'post-merge',
  'pre-push',
  'pre-auto-gc'
];

if (!existsSync(gitDir)) {
  process.exit(0);
}

mkdirSync(huskyInternalDir, { recursive: true });
rmSync(join(huskyInternalDir, 'husky.sh'), { force: true });
writeFileSync(join(huskyInternalDir, '.gitignore'), '*\n');
copyFileSync(join(rootDir, 'node_modules', 'husky', 'husky'), join(huskyInternalDir, 'h'));

for (const hookName of hookNames) {
  writeFileSync(join(huskyInternalDir, hookName), '#!/usr/bin/env sh\n. "$(dirname "$0")/h"\n', {
    mode: 0o755
  });
}

execFileSync(gitExecutable, ['config', 'core.hooksPath', '.husky/_'], {
  cwd: rootDir,
  stdio: 'inherit'
});
