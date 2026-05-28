import fs from "fs/promises";
import path from "path";

type NestedRecord = Record<string, string | NestedRecord>;

function parseArgs(argv: string[]) {
  const result: Record<string, string> = { _positional: "" };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const raw = token.slice(2);
      if (raw.includes("=")) {
        const [key, value] = raw.split("=", 2);
        result[key] = value;
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
          result[raw] = next;
          i += 1;
        } else {
          result[raw] = "true";
        }
      }
    } else {
      result._positional = [result._positional, token].filter(Boolean).join(" ");
    }
  }
  return result;
}

function parseList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFileName(name: string) {
  const cleaned = name.trim().replace(/\.md$/i, "");
  return `${cleaned.replace(/\s+/g, "_")}.md`;
}

async function ensureDirectory(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function writePlaceholder(filePath: string, title: string) {
  const exists = await fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

  if (exists) return;

  const content = `# ${title}\n\nWrite the documentation content for ${title} here.`;
  await fs.writeFile(filePath, content, "utf8");
}

async function generateStructure(options: Record<string, string>) {
  const tableName = options.table || options._positional;
  if (!tableName) {
    throw new Error("A table name is required. Use: generate <tableName> --configurations=... --links=... --modifiers=... --records=...");
  }

  const root = path.join(process.cwd(), "snippets", tableName);
  const directories = [
    root,
    path.join(root, "configurations", "brief"),
    path.join(root, "configurations", "condition"),
    path.join(root, "configurations", "flag"),
    path.join(root, "links", "brief"),
    path.join(root, "links", "condition"),
    path.join(root, "links", "flag"),
    path.join(root, "modifiers", "brief"),
    path.join(root, "modifiers", "details"),
    path.join(root, "records", "brief"),
    path.join(root, "records", "condition"),
  ];

  await Promise.all(directories.map(ensureDirectory));

  await writePlaceholder(path.join(root, "brief.md"), `${tableName} table`);

  const configurations = parseList(options.configurations);
  const links = parseList(options.links);
  const modifiers = parseList(options.modifiers);
  const records = parseList(options.records);

  for (const name of configurations) {
    await writePlaceholder(path.join(root, "configurations", "brief", toFileName(name)), name);
  }
  for (const name of links) {
    await writePlaceholder(path.join(root, "links", "brief", toFileName(name)), name);
  }
  for (const name of modifiers) {
    await writePlaceholder(path.join(root, "modifiers", "brief", toFileName(name)), name);
    await writePlaceholder(path.join(root, "modifiers", "details", toFileName(name)), `${name} details`);
  }
  for (const name of records) {
    await writePlaceholder(path.join(root, "records", "brief", toFileName(name)), name);
  }

  console.log(`Generated snippet structure for table '${tableName}' at snippets/${tableName}`);
  if (configurations.length) console.log(`  - configurations: ${configurations.join(", ")}`);
  if (links.length) console.log(`  - links: ${links.join(", ")}`);
  if (modifiers.length) console.log(`  - modifiers: ${modifiers.join(", ")}`);
  if (records.length) console.log(`  - records: ${records.join(", ")}`);
}

async function buildNestedTree(currentDir: string, baseDir: string): Promise<NestedRecord> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const result: NestedRecord = {};

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      result[entry.name] = await buildNestedTree(entryPath, baseDir);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const content = await fs.readFile(entryPath, "utf8");
      result[entry.name] = content;
    }
  }

  return result;
}

async function collapseSnippets(options: Record<string, string>) {
  const snippetsDir = path.join(process.cwd(), "snippets");
  const outputPath = path.resolve(options.output || path.join(process.cwd(), "snippets.json"));

  const tree = await buildNestedTree(snippetsDir, snippetsDir);
  await fs.writeFile(outputPath, JSON.stringify(tree, null, 2), "utf8");

  console.log(`Collapsed snippets directory into ${path.relative(process.cwd(), outputPath)}`);
}

async function writeNestedTree(currentDir: string, data: NestedRecord) {
  await ensureDirectory(currentDir);
  for (const key of Object.keys(data)) {
    const value = data[key];
    const targetPath = path.join(currentDir, key);
    if (typeof value === "string") {
      await fs.writeFile(targetPath, value, "utf8");
    } else {
      await writeNestedTree(targetPath, value);
    }
  }
}

async function expandSnippets(options: Record<string, string>) {
  const inputPath = path.resolve(options.input || path.join(process.cwd(), "snippets.json"));
  const text = await fs.readFile(inputPath, "utf8");
  const data = JSON.parse(text) as NestedRecord;
  const snippetsDir = path.join(process.cwd(), "snippets");

  await writeNestedTree(snippetsDir, data);
  console.log(`Expanded ${path.relative(process.cwd(), inputPath)} into snippets/`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  if (!command) {
    console.error("Usage: tsx scripts/snippet-tool.ts <generate|collapse|expand> [options]");
    process.exit(1);
  }

  switch (command) {
    case "generate":
      await generateStructure(options);
      break;
    case "collapse":
      await collapseSnippets(options);
      break;
    case "expand":
      await expandSnippets(options);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
