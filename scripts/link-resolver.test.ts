import { test } from "node:test";
import assert from "node:assert/strict";
import { pascalCase, deriveStructNames, resolveToken, findGlobalPath, linkifyText } from "./link-resolver";

test("pascalCase converts snake_case to PascalCase", () => {
  assert.equal(pascalCase("pixmap_table"), "PixmapTable");
  assert.equal(pascalCase("constant_width"), "ConstantWidth");
  assert.equal(pascalCase("use_constant_width"), "UseConstantWidth");
  assert.equal(pascalCase("color_tables"), "ColorTables");
});

test("deriveStructNames derives table/record struct pairs from the directory name", () => {
  assert.deepEqual(deriveStructNames("pixmap_table"), { tableStruct: "PixmapTable", recordStruct: "Pixmap" });
  assert.deepEqual(deriveStructNames("character_table"), { tableStruct: "CharacterTable", recordStruct: "Character" });
  assert.deepEqual(deriveStructNames("color_table"), { tableStruct: "ColorTable", recordStruct: "Color" });
  assert.deepEqual(deriveStructNames("font_table"), { tableStruct: "FontTable", recordStruct: "Font" });
});

const pixmapTableTree = {
  brief: { "brief.md": "..." },
  configurations: {
    brief: { "custom_width.md": "...", "custom_height.md": "...", "custom_bits_per_pixel.md": "..." },
    condition: { "custom_width.md": "...", "custom_height.md": "...", "custom_bits_per_pixel.md": "..." },
    flag: { "use_custom_width.md": "...", "use_custom_height.md": "...", "use_custom_bits_per_pixel.md": "..." },
  },
  links: {
    brief: { "color_tables.md": "..." },
    condition: { "color_tables.md": "..." },
    flag: { "link_color_tables.md": "..." },
  },
  records: {
    brief: { "custom_width.md": "...", "custom_height.md": "...", "custom_bits_per_pixel.md": "...", "data.md": "..." },
    condition: { "custom_width.md": "...", "custom_height.md": "...", "custom_bits_per_pixel.md": "...", "data.md": "..." },
  },
};

test("resolveToken finds a record field in the local table scope", () => {
  assert.equal(resolveToken("data", "pixmap_table", pixmapTableTree, {}), "Pixmap::data");
});

test("resolveToken finds a table-level configuration value in the local table scope", () => {
  assert.equal(resolveToken("custom_width", "pixmap_table", pixmapTableTree, {}), "Pixmap::custom_width");
});

test("resolveToken finds a configuration flag and maps it to the bitflag variant", () => {
  assert.equal(
    resolveToken("use_custom_width", "pixmap_table", pixmapTableTree, {}),
    "PixmapTableConfigurationFlags::CustomWidth"
  );
});

test("resolveToken applies the links plural-strip + _indexes transform", () => {
  assert.equal(resolveToken("color_tables", "pixmap_table", pixmapTableTree, {}), "PixmapTable::color_table_indexes");
});

test("resolveToken maps a link flag to its bitflag variant", () => {
  assert.equal(
    resolveToken("link_color_tables", "pixmap_table", pixmapTableTree, {}),
    "PixmapTableLinkFlags::LinkColorTables"
  );
});

test("resolveToken passes through already-qualified paths unchanged", () => {
  assert.equal(resolveToken("Font::linked_character_table_indexes", "font_table", {}, {}), "Font::linked_character_table_indexes");
});

test("resolveToken returns null for an unknown token", () => {
  assert.equal(resolveToken("u8", "pixmap_table", pixmapTableTree, {}), null);
});

const dataTypesTree = {
  "u8.md": "...",
  "ColorType.md": "...",
  ColorType: { "Dynamic.md": "...", "Absolute.md": "..." },
};

test("findGlobalPath finds a top-level type by exact name", () => {
  assert.equal(findGlobalPath("u8", dataTypesTree), "u8");
  assert.equal(findGlobalPath("ColorType", dataTypesTree), "ColorType");
});

test("findGlobalPath finds a nested variant and qualifies it with its enclosing enum", () => {
  assert.equal(findGlobalPath("Dynamic", dataTypesTree), "ColorType::Dynamic");
});

test("findGlobalPath returns null when nothing matches", () => {
  assert.equal(findGlobalPath("NoSuchType", dataTypesTree), null);
});

test("linkifyText rewrites a resolvable backtick span into an intra-doc link", () => {
  const text = "The exact code point length of each `code_points` field in this table.";
  const characterTableTree = {
    records: { brief: { "code_points.md": "..." }, condition: { "code_points.md": "..." } },
  };
  const result = linkifyText(text, "character_table", characterTableTree, {});
  assert.equal(result, "The exact code point length of each [`Character::code_points`] field in this table.");
});

test("linkifyText leaves unresolvable spans untouched", () => {
  const text = "A single `u8` value.";
  const result = linkifyText(text, "pixmap_table", {}, {});
  assert.equal(result, "A single `u8` value.");
});

test("linkifyText handles multiple spans in one string", () => {
  const text = "Uses `red` and `blue`.";
  const colorTableTree = {
    records: { brief: { "red.md": "...", "blue.md": "..." }, condition: { "red.md": "...", "blue.md": "..." } },
  };
  const result = linkifyText(text, "color_table", colorTableTree, {});
  assert.equal(result, "Uses [`Color::red`] and [`Color::blue`].");
});
