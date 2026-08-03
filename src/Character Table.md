\textinput{../snippets/character_table/brief.md}

## Table Structure

### Identifier
- **Value**: `0x01`

### Modifier Flags

| Bit | Name                     | Description                                                                                          |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| 0   | `use_advance_x`          | \textinput{../snippets/character_table/modifiers/brief/use_advance_x.md}      |
| 1   | `use_pixmap_index`       | \textinput{../snippets/character_table/modifiers/brief/use_pixmap_index.md}                |
| 2   | `use_pixmap_table_index` | \textinput{../snippets/character_table/modifiers/brief/use_pixmap_table_index.md} |
| 3-7 | —                        | \textinput{../snippets/phrase/reserved.md}                                                                              |

#### Flag Details

- **`use_advance_x`**: \textinput{../snippets/character_table/modifiers/details/use_advance_x.md}
- **`use_pixmap_index`**: \textinput{../snippets/character_table/modifiers/details/use_pixmap_index.md}
- **`use_pixmap_table_index`**: \textinput{../snippets/character_table/modifiers/details/use_pixmap_table_index.md}

### Configuration Flags

| Bit | Name                           | Description                                                     |
| --- | ------------------------------ | --------------------------------------------------------------- |
| 0   | `use_constant_code_point_count` | \textinput{../snippets/character_table/configurations/flag/use_constant_code_point_count.md} |
| 1-7 | —                              | \textinput{../snippets/phrase/reserved.md}                                         |

#### Configuration Values

| Name                       | Type | Condition                                    | Description                                                         |
| -------------------------- | ---- | -------------------------------------------- | ------------------------------------------------------------------- |
| `constant_code_point_count` | `u8` | \textinput{../snippets/character_table/configurations/condition/constant_code_point_count.md} | \textinput{../snippets/character_table/configurations/brief/constant_code_point_count.md} |

### Table Links

| Bit | Name                 | Description                                   |
| --- | -------------------- | --------------------------------------------- |
| 0   | `link_pixmap_tables` | \textinput{../snippets/character_table/links/flag/link_pixmap_tables.md} |
| 1-7 | —                    | \textinput{../snippets/phrase/reserved.md}                       |

#### Link Arrays

| Name            | Type      | Condition                          | Description                                                   |
| --------------- | --------- | ---------------------------------- | ------------------------------------------------------------- |
| `pixmap_tables` | `Vec<u8>` | \textinput{../snippets/character_table/links/condition/pixmap_tables.md} | \textinput{../snippets/character_table/links/brief/pixmap_tables.md} |

## Character Record

Each character record contains the following fields in order:

| Field                | Type                 | Condition                                       | Description                                                                                 |
| -------------------- | -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `advance_x`          | `u8`                 | \textinput{../snippets/character_table/records/condition/advance_x.md} | \textinput{../snippets/character_table/records/brief/advance_x.md}                     |
| `pixmap_index`       | `u8`                 | \textinput{../snippets/character_table/records/condition/pixmap_index.md} | \textinput{../snippets/character_table/records/brief/pixmap_index.md}                                   |
| `pixmap_table_index` | `u8` | \textinput{../snippets/character_table/records/condition/pixmap_table_index.md} | \textinput{../snippets/character_table/records/brief/pixmap_table_index.md}                                |
| `code_points`         | `String`                | \textinput{../snippets/character_table/records/condition/code_points.md} | \textinput{../snippets/character_table/records/brief/code_points.md} |

### Record Layout Examples
 
**Example 1: Minimal record** (no modifier flags enabled)
 
Character `A`, using the default advance and the default pixmap index.
 
| Byte | Field         | Binary     | Hex  | Description               |
| ---- | ------------- | ---------- | ---- | ------------------------- |
| 1    | `code_points` | `01000001` | `41` | `A` (U+0041)              |
| 2    | —             | `00000000` | `00` | Null terminator           |
 
**Example 2: With custom advance** (`use_advance_x`)
 
Character `W` with a custom 12 pixel advance.
 
| Byte | Field         | Binary     | Hex  | Description               |
| ---- | ------------- | ---------- | ---- | ------------------------- |
| 1    | `advance_x`   | `00001100` | `0C` | Advance 12 pixels         |
| 2    | `code_points` | `01010111` | `57` | `W` (U+0057)              |
| 3    | —             | `00000000` | `00` | Null terminator           |
 
**Example 3: With pixmap index** (`use_pixmap_index`)
 
Character `é` drawn with the pixmap at index 5. The code point needs two UTF-8 bytes.
 
| Byte | Field          | Binary     | Hex  | Description                        |
| ---- | -------------- | ---------- | ---- | ---------------------------------- |
| 1    | `pixmap_index` | `00000101` | `05` | Pixmap 5                           |
| 2    | `code_points`  | `11000011` | `C3` | `é` (U+00E9), byte 1 of 2          |
| 3    | `code_points`  | `10101001` | `A9` | `é` (U+00E9), byte 2 of 2          |
| 4    | —              | `00000000` | `00` | Null terminator                    |
 
**Example 4: With all optional fields**
 
Character `👍` with advance 16, pixmap index 42, drawn from linked Pixmap Table 1.
 
| Byte | Field                | Binary     | Hex  | Description                        |
| ---- | -------------------- | ---------- | ---- | ---------------------------------- |
| 1    | `advance_x`          | `00010000` | `10` | Advance 16 pixels                  |
| 2    | `pixmap_index`       | `00101010` | `2A` | Pixmap 42                          |
| 3    | `pixmap_table_index` | `00000001` | `01` | Pixmap Table 1                     |
| 4    | `code_points`        | `11110000` | `F0` | `👍` (U+1F44D), byte 1 of 4        |
| 5    | `code_points`        | `10011111` | `9F` | `👍` (U+1F44D), byte 2 of 4        |
| 6    | `code_points`        | `10010001` | `91` | `👍` (U+1F44D), byte 3 of 4        |
| 7    | `code_points`        | `10001101` | `8D` | `👍` (U+1F44D), byte 4 of 4        |
| 8    | —                    | `00000000` | `00` | Null terminator                    |
 
**Example 5: With a constant code point count**
 
Configuration: `constant_code_point_count = 1`, so every character in the table is exactly one code point.
 
| Byte | Field         | Binary     | Hex  | Description                          |
| ---- | ------------- | ---------- | ---- | ------------------------------------ |
| 1    | `code_points` | `01000010` | `42` | `B` (U+0042), no terminator required |
 
**Example 6: Multi-code-point cluster**
 
The ligature `!=` stored as a single character, with no constant code point count set.
 
| Byte | Field         | Binary     | Hex  | Description                       |
| ---- | ------------- | ---------- | ---- | --------------------------------- |
| 1    | `code_points` | `00100001` | `21` | `!` (U+0021), code point 1 of 2   |
| 2    | `code_points` | `00111101` | `3D` | `=` (U+003D), code point 2 of 2   |
| 3    | —             | `00000000` | `00` | Null terminator ends the cluster  |
 
## Complete Table Example
 
The following byte sequence defines a minimal Character Table with two characters (`A` and `B`), using custom advance values and linking to one Pixmap Table:
 
| Bytes | Binary     | Hex  | Description                                                    |
| ------- | ---------- | ---- | -------------------------------------------------------------- |
| 1       | `00000001` | `01` | Table identifier for Character Table                           |
| 2       | `00000011` | `03` | Modifier flags: `use_advance_x` and `use_pixmap_index` enabled |
| 3       | `00000001` | `01` | Configuration flags: `use_constant_code_point_count` enabled   |
| 4       | `00000001` | `01` | `constant_code_point_count` = 1 code point                     |
| 5       | `00000001` | `01` | Table links: `link_pixmap_tables` enabled                      |
| 6       | `00000001` | `01` | Pixmap table array length = 1                                  |
| 7       | `00000000` | `00` | Link to Pixmap Table at index 0                                |
| 8       | `00000010` | `02` | Record count = 2 characters                                    |
| 9       | `00001000` | `08` | Character 0: `advance_x` = 8 pixels                            |
| 10      | `00000000` | `00` | Character 0: `pixmap_index` = 0                                |
| 11      | `01000001` | `41` | Character 0: `code_points` = `A`                               |
| 12      | `00001000` | `08` | Character 1: `advance_x` = 8 pixels                            |
| 13      | `00000001` | `01` | Character 1: `pixmap_index` = 1                                |
| 14      | `01000010` | `42` | Character 1: `code_points` = `B`                               |
