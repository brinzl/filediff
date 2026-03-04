type Val = string | number | boolean | string[];
interface ParsedArgs { [key: string]: Val; _: string[]; }

const toNum = (v: string): Val => (v !== '' && !isNaN(Number(v)) ? Number(v) : v);

export default function argv(args: string[]): ParsedArgs {
  const result: ParsedArgs = { _: [] };
  const params = [...args];

  while (params.length > 0) {
    const arg = params.shift()!;

    if (arg === '--') {
      result._.push(...params.splice(0));
      break;
    }

    if (arg.startsWith('--')) {
      const [, no, key, eqVal] = arg.match(/^--(no-)?([^=]+)(?:=(.*))?$/) || [];
      if (!key) continue;

      if (no) result[key] = false;
      else if (eqVal !== undefined) result[key] = toNum(eqVal);
      else {
        const next = params[0];
        const isNextValue = next !== undefined && !next.startsWith('-');
        result[key] = isNextValue ? toNum(params.shift()!) : true;
      }
      continue;
    }

    if (arg.startsWith('-') && arg.length > 1) {
      const rest = arg.slice(1);

      if (rest.length === 1 || /^[a-zA-Z]\d+/.test(rest)) {
        const key = rest[0];
        const val = rest.slice(1);
        if (val) result[key] = toNum(val);
        else {
          const next = params[0];
          result[key] = (next !== undefined && !next.startsWith('-')) ? toNum(params.shift()!) : true;
        }
      } else {
        [...rest].forEach(c => result[c] = true);
      }
      continue;
    }

    result._.push(arg);
  }

  return result;
}