import chalk from 'chalk';

export function printJson(data: any): void {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

export function printKeyValue(obj: Record<string, string>): void {
  const maxKey = Math.max(...Object.keys(obj).map(k => k.length));
  for (const [key, value] of Object.entries(obj)) {
    process.stdout.write(`${chalk.bold(key.padEnd(maxKey))}  ${value}\n`);
  }
}

export interface Column {
  key: string;
  header: string;
}

export function printTable(rows: Record<string, string>[], columns: Column[]): void {
  if (!rows.length) return;

  const widths = columns.map(col =>
    Math.max(col.header.length, ...rows.map(r => (r[col.key] ?? '').length))
  );

  const header = columns.map((col, i) => chalk.bold(col.header.padEnd(widths[i]))).join('  ');
  process.stdout.write(header + '\n');
  process.stdout.write(widths.map(w => '─'.repeat(w)).join('──') + '\n');

  for (const row of rows) {
    const line = columns.map((col, i) => (row[col.key] ?? '').padEnd(widths[i])).join('  ');
    process.stdout.write(line + '\n');
  }
}

export function printError(msg: string): void {
  process.stderr.write(chalk.red(`Error: ${msg}`) + '\n');
}
