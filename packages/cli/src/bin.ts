#!/usr/bin/env node
import { parseGenerateArgs, runGenerateCommand } from "./index.js";

async function main(): Promise<void> {
  try {
    const parsed = parseGenerateArgs(process.argv.slice(2));
    const written = await runGenerateCommand(parsed.options);
    process.stdout.write(`Generated ${written.length} file(s)\n`);
    written.forEach((file) => process.stdout.write(`- ${file}\n`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}

void main();
