const colors = Object.freeze({
  reset: '\u001b[0m',
  gray: '\u001b[90m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  bold: '\u001b[1m',
});

interface LevelColors {
  datetime: string;
  level: string;
  message: string;
}

const levels: Record<string, LevelColors> = Object.freeze({
  info: {
    datetime: colors.gray,
    level: colors.blue,
    message: colors.white,
  },
  warn: {
    datetime: colors.gray,
    level: colors.yellow,
    message: colors.yellow,
  },
  error: {
    datetime: colors.gray,
    level: colors.red,
    message: colors.red,
  },
  debug: {
    datetime: colors.gray,
    level: colors.magenta,
    message: colors.gray,
  },
});

function formatTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:${s}.${ms}`;
}

function formatArgs(args: unknown[]): string {
  return args
    .map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    })
    .join(' ');
}

function formatStatusColor(statusCode: number): string {
  if (statusCode >= 500) return colors.red;
  if (statusCode >= 400) return colors.yellow;
  if (statusCode >= 300) return colors.yellow;
  return colors.green;
}

function log(level: string, ...args: unknown[]): void {
  const leelColors = levels[level];
  if (!colors) return;
  const tag = level.toUpperCase().padEnd(5);
  const timestamp = formatTimestamp();
  const message = formatArgs(args);
  const line =
    `${leelColors.datetime}[${timestamp}]${colors.reset} ` +
    `${leelColors.level}[${tag}]${colors.reset} ` +
    `${leelColors.message}${message}${colors.reset}`;

  console.log(line);
}

export const logger = {
  info(...args: unknown[]): void { log('info', ...args); },
  warn(...args: unknown[]): void { log('warn', ...args); },
  error(...args: unknown[]): void { log('error', ...args); },
  debug(...args: unknown[]): void { log('debug', ...args); },
  request(method: string, path: string, statusCode: number, durationMs: number): void {
    const leelColors = levels[statusCode >= 500 ? 'error' : 'info'];
    const tag = statusCode >= 500 ? 'ERROR' : 'INFO ';
    const timestamp = formatTimestamp();
    const statusColor = formatStatusColor(statusCode);
    const line =
      `${leelColors.datetime}[${timestamp}]${colors.reset} ` +
      `${leelColors.level}[${tag}]${colors.reset} ` +
      `${colors.cyan}${method}${colors.reset} ` +
      `${colors.white}${path}${colors.reset} ` +
      `${statusColor}${statusCode}${colors.reset} ` +
      `${colors.gray}${durationMs}ms${colors.reset}`;

    console.log(line);
  },
};

export default logger;
