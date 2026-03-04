import { spawn } from 'node:child_process';

const PLATFORM_COMMANDS: Record<string, [string, string[]]> = {
  darwin: ['open', []],
  win32: ['cmd', ['/c', 'start', '']],
  linux: ['xdg-open', []],
};

export function open(url: string): void {
  const [cmd, baseArgs] = PLATFORM_COMMANDS[process.platform] ?? PLATFORM_COMMANDS.linux;

  spawn(cmd, [...baseArgs, url], {
    stdio: 'ignore',
    detached: true,
  }).unref();
}

export function parsePorcelain(raw: string): { status: string; path: string }[] {
  const entryRegex = /^(..)\s+(?:.* -> )?(.*)$/gm;
  // Regex breakdown:
  // ^(..)   -> Captures the first two characters (status)
  // \s+     -> Matches the whitespace separator
  // (.*?)   -> Captures the file path (non-greedy)
  // (?: -> |$) -> If renamed, captures the part after ' -> ', else end of line
  return Array.from(raw.matchAll(entryRegex), ([, status, path]) => {
    const s = status.trim() === '??' ? 'A' : status.trim();
    const p = path.replace(/\/$/, '');
    return p ? { status: s, path: p } : null;
  }).filter((item): item is { status: string; path: string } => !!item);
}