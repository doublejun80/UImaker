import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateHtmlCss, generateReactTailwind } from "@uiverse/exporter";
import { assertValidBundle, type ExportTarget, type GenerateOptions } from "@uiverse/schema";

export interface GenerateCommandOptions {
  inputPath: string;
  outDir: string;
  format: ExportTarget;
  screen?: string;
  overwrite?: boolean;
}

export interface ParsedCommand {
  name: "generate";
  options: GenerateCommandOptions;
}

export function parseGenerateArgs(argv: string[]): ParsedCommand {
  const [command, inputPath, ...rest] = argv;

  if (command !== "generate") {
    throw new Error("Only the generate command is supported in V1.");
  }

  if (!inputPath) {
    throw new Error("Usage: uiverse generate <bundle.json> --format <react-tailwind|html-css> --out <dir>");
  }

  const options: Partial<GenerateCommandOptions> = { inputPath, overwrite: false };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    const next = rest[index + 1];

    if (token === "--overwrite") {
      options.overwrite = true;
      continue;
    }

    if (!next) {
      throw new Error(`Missing value for ${token}`);
    }

    if (token === "--format") {
      if (next !== "react-tailwind" && next !== "html-css") {
        throw new Error(`Unsupported format: ${next}`);
      }
      options.format = next;
    } else if (token === "--out") {
      options.outDir = next;
    } else if (token === "--screen") {
      options.screen = next;
    } else {
      throw new Error(`Unknown option: ${token}`);
    }

    index += 1;
  }

  if (!options.format || !options.outDir) {
    throw new Error("Both --format and --out are required.");
  }

  return {
    name: "generate",
    options: options as GenerateCommandOptions
  };
}

export async function runGenerateCommand(options: GenerateCommandOptions): Promise<string[]> {
  const raw = await readFile(options.inputPath, "utf8");
  const bundle = assertValidBundle(JSON.parse(raw));
  const generateOptions: GenerateOptions | undefined = options.screen ? { screen: options.screen } : undefined;
  const result =
    options.format === "react-tailwind"
      ? generateReactTailwind(bundle, generateOptions)
      : generateHtmlCss(bundle, generateOptions);

  const writtenPaths: string[] = [];
  await mkdir(options.outDir, { recursive: true });

  for (const file of result.files) {
    const destination = path.join(options.outDir, file.path);
    await mkdir(path.dirname(destination), { recursive: true });

    if (!options.overwrite) {
      try {
        await readFile(destination, "utf8");
        throw new Error(`Refusing to overwrite ${destination}. Pass --overwrite to replace existing files.`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code && (error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    await writeFile(destination, file.content, "utf8");
    writtenPaths.push(destination);
  }

  return writtenPaths;
}