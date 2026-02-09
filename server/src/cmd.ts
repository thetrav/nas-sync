import { spawn } from 'node:child_process';

export function run(cmd: string) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, { stdio: 'inherit', shell: true });
    p.on('exit', code => { code === 0 ? resolve() : reject(code); });
  });
}
