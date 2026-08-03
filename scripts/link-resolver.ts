export type SnippetTree = Record<string, string | SnippetTree>;

export function pascalCase(snakeCase: string): string {
  return snakeCase
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export function deriveStructNames(tableDir: string): { tableStruct: string; recordStruct: string } {
  const tableStruct = pascalCase(tableDir);
  const recordStruct = pascalCase(tableDir.replace(/_table$/, ""));
  return { tableStruct, recordStruct };
}

function isLeaf(node: string | SnippetTree | undefined): node is string {
  return typeof node === "string";
}

function stripExt(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function basenamesIn(tree: SnippetTree, ...path: string[]): string[] {
  let node: string | SnippetTree = tree;
  for (const segment of path) {
    if (isLeaf(node) || !(segment in node)) return [];
    node = node[segment];
  }
  if (isLeaf(node)) return [];
  return Object.keys(node).filter((k) => k.endsWith(".md")).map(stripExt);
}

export function resolveToken(
  token: string,
  tableDir: string,
  localTree: SnippetTree,
  globalTrees: Record<string, SnippetTree>
): string | null {
  if (token.includes("::")) return token;

  const { tableStruct, recordStruct } = deriveStructNames(tableDir);

  if (basenamesIn(localTree, "records", "brief").includes(token)) {
    return `${recordStruct}::${token}`;
  }
  if (basenamesIn(localTree, "configurations", "brief").includes(token)) {
    return `${tableStruct}::${token}`;
  }
  if (token.startsWith("use_")) {
    // Configuration flag variants strip the "use_" prefix (e.g. ConstantWidth).
    if (basenamesIn(localTree, "configurations", "flag").includes(token)) {
      const flagName = token.slice("use_".length);
      return `${tableStruct}ConfigurationFlags::${pascalCase(flagName)}`;
    }
    // Modifier flag variants keep the "use_" prefix (e.g. UseAdvanceX).
    if (basenamesIn(localTree, "modifiers", "brief").includes(token)) {
      return `${tableStruct}ModifierFlags::${pascalCase(token)}`;
    }
  }
  if (token.startsWith("link_")) {
    // Link flag variants keep the "link_" prefix (e.g. LinkColorTables).
    if (basenamesIn(localTree, "links", "flag").includes(token)) {
      return `${tableStruct}LinkFlags::${pascalCase(token)}`;
    }
  }
  if (basenamesIn(localTree, "links", "brief").includes(token)) {
    const fieldName = `${token.replace(/s$/, "")}_indexes`;
    return `${tableStruct}::${fieldName}`;
  }

  for (const globalTree of Object.values(globalTrees)) {
    const globalMatch = findGlobalPath(token, globalTree);
    if (globalMatch) return globalMatch;
  }

  return null;
}

export function linkifyText(
  text: string,
  tableDir: string,
  localTree: SnippetTree,
  globalTrees: Record<string, SnippetTree>
): string {
  return text.replace(/`([^`\s]+)`/g, (fullMatch, token: string) => {
    const resolved = resolveToken(token, tableDir, localTree, globalTrees);
    return resolved ? `[\`${resolved}\`]` : fullMatch;
  });
}

export function findGlobalPath(name: string, tree: SnippetTree, prefix: string[] = []): string | null {
  for (const [key, value] of Object.entries(tree)) {
    if (key.endsWith(".md") && stripExt(key) === name) {
      return prefix.length ? `${prefix[prefix.length - 1]}::${name}` : name;
    }
    if (!isLeaf(value)) {
      const nested = findGlobalPath(name, value, [...prefix, key]);
      if (nested) return nested;
    }
  }
  return null;
}
