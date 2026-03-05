import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileP = promisify(execFile);

type GitArgs = Array<string | Record<string, any>>;

interface SpecialOptions {
  $gitDir?: string;
  $workTree?: string;
  $nullOnError?: boolean;
}

function processArgs(args: GitArgs) {
  const special: SpecialOptions = {};
  const commandArgs: string[] = [];

  for (const arg of args) {
    if (typeof arg === 'string') {
      commandArgs.push(arg);
      continue;
    }

    for (const [key, val] of Object.entries(arg)) {
      if (key.startsWith('$')) {
        (special as any)[key] = val;
      } else if (val !== false) {
        const prefix = key.length === 1 ? '-' : '--';
        const sep = key.length === 1 || val === true ? '' : '=';
        commandArgs.push(`${prefix}${key}${val === true ? '' : `${sep}${val}`}`);
      }
    }
  }

  const globals = [
    special.$gitDir && `--git-dir=${special.$gitDir}`,
    special.$workTree && `--work-tree=${special.$workTree}`
  ].filter(Boolean) as string[];

  return { fullArgs: [...globals, ...commandArgs], special };
}

async function git(first: string | GitArgs, ...rest: GitArgs): Promise<string | null> {
  const args = Array.isArray(first) ? first : [first, ...rest];
  const { fullArgs, special } = processArgs(args);

  try {
    const { stdout } = await execFileP('git', fullArgs, {
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout.trim();
  } catch (err: any) {
    if (special.$nullOnError) return null;
    throw new Error(err.stderr?.trim() || err.message);
  }
}

const handler = {
  get: (target: any, prop: string) => {
    if (prop in target) return target[prop];
    const cmd = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
    return (...args: GitArgs) => target(cmd, ...args);
  }
};

export default new Proxy(git, handler) as typeof git & Record<string, (...args: GitArgs) => Promise<string>>;