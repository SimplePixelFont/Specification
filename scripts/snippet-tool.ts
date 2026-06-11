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
    await writePlaceholder(path.join(root, "configurations", "condition", toFileName(name)), `${name} condition`);
    await writePlaceholder(path.join(root, "configurations", "flag", toFileName(`use_${name}`)), `use_${name}`);
  }
  for (const name of links) {
    await writePlaceholder(path.join(root, "links", "brief", toFileName(name)), name);
    await writePlaceholder(path.join(root, "links", "condition", toFileName(name)), `${name} condition`);
    await writePlaceholder(path.join(root, "links", "flag", toFileName(`link_${name}`)), `link_${name}`);
  }
  for (const name of modifiers) {
    await writePlaceholder(path.join(root, "modifiers", "brief", toFileName(name)), name);
    await writePlaceholder(path.join(root, "modifiers", "details", toFileName(name)), `${name} details`);
  }
  for (const name of records) {
    await writePlaceholder(path.join(root, "records", "brief", toFileName(name)), name);
    await writePlaceholder(path.join(root, "records", "condition", toFileName(name)), `${name} condition`);
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

function getRelativeSnippetPath(snippetType: string, category: string, filename: string): string {
  // filename is already in the correct format (e.g., "use_advance_x")
  return `../snippets/${snippetType}/${category}/${filename}.md`;
}

async function listMdFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/i, ""));
  } catch {
    return [];
  }
}

function fileNameToDisplayName(fileName: string): string {
  // "use_advance_x" -> "use_advance_x", "constant_codepoint_count" -> "constant_codepoint_count"
  // Return as-is for display in backticks
  return fileName;
}

function addTableHeader(header: string): string {
  return `\n## ${header}\n`;
}

function generateModifiersSection(
  tableName: string,
  modifiers: string[],
  snippetType: string
): string {
  const lines: string[] = [];

  lines.push(addTableHeader("Modifier Flags"));
  lines.push("| Bit | Name | Description |");
  lines.push("| --- | ---- | ----------- |");

  for (let i = 0; i < modifiers.length; i++) {
    const modFileName = modifiers[i];
    const flagPath = getRelativeSnippetPath(snippetType, "modifiers/brief", modFileName);
    lines.push(
      `| ${i} | \`${modFileName}\` | \\textinput{${flagPath}} |`
    );
  }

  // Add reserved bits
  const nextBit = modifiers.length;
  if (nextBit < 8) {
    const endBit = nextBit === 7 ? "7" : `${nextBit}-7`;
    lines.push(
      `| ${endBit} | — | \\textinput{../snippets/phrase/reserved.md} |`
    );
  }

  lines.push("\n### Flag Details\n");

  for (const modFileName of modifiers) {
    const detailsPath = getRelativeSnippetPath(snippetType, "modifiers/details", modFileName);
    lines.push(`- **\`${modFileName}\`**: \\textinput{${detailsPath}}`);
  }

  return lines.join("\n");
}

function generateConfigurationsSection(
  tableName: string,
  configs: string[],
  snippetType: string
): string {
  const lines: string[] = [];

  lines.push(addTableHeader("Configuration Flags"));
  lines.push("| Bit | Name | Description |");
  lines.push("| --- | ---- | ----------- |");

  for (let i = 0; i < configs.length; i++) {
    const configBriefName = configs[i]; // e.g., "constant_code_point_count"
    const flagName = "use_" + configBriefName; // e.g., "use_constant_code_point_count"
    const flagPath = getRelativeSnippetPath(snippetType, "configurations/flag", flagName);
    lines.push(
      `| ${i} | \`${flagName}\` | \\textinput{${flagPath}} |`
    );
  }

  // Add reserved bits
  const nextBit = configs.length;
  if (nextBit < 8) {
    const endBit = nextBit === 7 ? "7" : `${nextBit}-7`;
    lines.push(
      `| ${endBit} | — | \\textinput{../snippets/phrase/reserved.md} |`
    );
  }

  lines.push("\n### Configuration Values\n");
  lines.push("| Name | Type | Condition | Description |");
  lines.push("| ---- | ---- | --------- | ----------- |");

  for (const configBriefName of configs) {
    const briefPath = getRelativeSnippetPath(snippetType, "configurations/brief", configBriefName);
    const condPath = getRelativeSnippetPath(snippetType, "configurations/condition", configBriefName);
    lines.push(
      `| \`${configBriefName}\` | \`u8\` | \\textinput{${condPath}} | \\textinput{${briefPath}} |`
    );
  }

  return lines.join("\n");
}

function generateLinksSection(
  tableName: string,
  links: string[],
  snippetType: string
): string {
  const lines: string[] = [];

  lines.push(addTableHeader("Table Links"));
  lines.push("| Bit | Name | Description |");
  lines.push("| --- | ---- | ----------- |");

  for (let i = 0; i < links.length; i++) {
    const linkBriefName = links[i]; // e.g., "pixmap_tables"
    const flagName = "link_" + linkBriefName; // e.g., "link_pixmap_tables"
    // Note: Template shows looking in condition directory for the flag description
    const flagPath = getRelativeSnippetPath(snippetType, "links/flag", flagName);
    lines.push(
      `| ${i} | \`${flagName}\` | \\textinput{${flagPath}} |`
    );
  }

  // Add reserved bits
  const nextBit = links.length;
  if (nextBit < 8) {
    const endBit = nextBit === 7 ? "7" : `${nextBit}-7`;
    lines.push(
      `| ${endBit} | — | \\textinput{../snippets/phrase/reserved.md} |`
    );
  }

  lines.push("\n### Link Arrays\n");
  lines.push("| Name | Type | Condition | Description |");
  lines.push("| ---- | ---- | --------- | ----------- |");

  for (const linkBriefName of links) {
    const briefPath = getRelativeSnippetPath(snippetType, "links/brief", linkBriefName);
    const condPath = getRelativeSnippetPath(snippetType, "links/condition", linkBriefName);
    lines.push(
      `| \`${linkBriefName}\` | \`Vec<u8>\` | \\textinput{${condPath}} | \\textinput{${briefPath}} |`
    );
  }

  return lines.join("\n");
}

function generateRecordsSection(
  tableName: string,
  records: string[],
  snippetType: string
): string {
  const lines: string[] = [];

  lines.push(addTableHeader("Record Fields\n"));
  lines.push("Each record contains the following fields in order:\n");
  lines.push("| Field | Type | Condition | Description |");
  lines.push("| ----- | ---- | --------- | ----------- |");

  for (const recordFileName of records) {
    const briefPath = getRelativeSnippetPath(snippetType, "records/brief", recordFileName);
    const condPath = getRelativeSnippetPath(snippetType, "records/condition", recordFileName);
    lines.push(
      `| \`${recordFileName}\` | \`[TYPE_PLACEHOLDER]\` | \\textinput{${condPath}} | \\textinput{${briefPath}} |`
    );
  }

  return lines.join("\n");
}

function generateExamplesSection(tableName: string): string {
  const lines: string[] = [];

  lines.push(addTableHeader("Record Layout Examples\n"));
  lines.push(
    "Provide example records demonstrating various field combinations:\n"
  );
  lines.push(
    "**Example 1: Minimal record** (no optional fields)\n```\n[EXAMPLE_PLACEHOLDER]\n```\n"
  );
  lines.push(
    "**Example 2: With optional fields**\n```\n[EXAMPLE_PLACEHOLDER]\n```\n"
  );

  lines.push(addTableHeader("Complete Table Example\n"));
  lines.push(
    "The following byte sequence defines a minimal table with example records:\n"
  );
  lines.push("| Byte(s) | Binary | Hex | Description |");
  lines.push("| ------- | ------ | --- | ----------- |");
  lines.push("| 1 | `[BINARY_PLACEHOLDER]` | `[HEX_PLACEHOLDER]` | Table identifier |");
  lines.push("| ... | ... | ... | [DESCRIPTION_PLACEHOLDER] |");

  return lines.join("\n");
}

async function generateDocument(options: Record<string, string>) {
  const tableName = options.table || options._positional;
  if (!tableName) {
    throw new Error(
      "A table name is required. Use: document <tableName> --output=<path>"
    );
  }

  const tableDir = path.join(process.cwd(), "snippets", tableName);
  const outputPath = path.resolve(
    options.output || path.join(process.cwd(), `src/${tableName}.md`)
  );

  // Check if table directory exists
  const exists = await fs
    .access(tableDir)
    .then(() => true)
    .catch(() => false);

  if (!exists) {
    throw new Error(`Table directory not found: ${tableDir}`);
  }

  // Build document structure
  const lines: string[] = [];

  // Add brief introduction
  const relativePath = path.relative(process.cwd(), tableDir);
  lines.push(`\\textinput{../${relativePath}/brief.md}\n`);

  // Add table structure section
  lines.push("## Table Structure\n");
  lines.push("### Identifier");
  lines.push("- **Value**: \`[IDENTIFIER_PLACEHOLDER]\`\n");

  // Discover available snippets and generate appropriate sections
  const modifiersBrief = await listMdFiles(path.join(tableDir, "modifiers", "brief"));
  const configsBrief = await listMdFiles(path.join(tableDir, "configurations", "brief"));
  const linksBrief = await listMdFiles(path.join(tableDir, "links", "brief"));
  const recordsBrief = await listMdFiles(path.join(tableDir, "records", "brief"));

  if (modifiersBrief.length > 0) {
    lines.push(generateModifiersSection(tableName, modifiersBrief, tableName));
  }

  if (configsBrief.length > 0) {
    lines.push(generateConfigurationsSection(tableName, configsBrief, tableName));
  }

  if (linksBrief.length > 0) {
    lines.push(generateLinksSection(tableName, linksBrief, tableName));
  }

  if (recordsBrief.length > 0) {
    lines.push(generateRecordsSection(tableName, recordsBrief, tableName));
  }

  // Add examples section
  lines.push(generateExamplesSection(tableName));

  const doc = lines.join("\n");
  await fs.writeFile(outputPath, doc, "utf8");

  console.log(
    `Generated document for table '${tableName}' at ${path.relative(process.cwd(), outputPath)}
    Make sure to reorder fields accordingly!`
  );
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  if (!command) {
    console.error(
      "Usage: tsx scripts/snippet-tool.ts <generate|collapse|expand|document> [options]"
    );
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
    case "document":
      await generateDocument(options);
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
