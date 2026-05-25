Defines mappings between UTF-8 codepoint sequences (characters) and their visual representations (pixmaps).

## Use Cases

- **Character-to-glyph mapping** - Associates text characters, including single utf8 codepoints, ligatures, and grapheme clusters, with their pixmap representation.

## Table Structure

### Identifier
- **Value**: `0x01`

### Modifier Flags

| Bit | Name                     | Description                                                                                          |
| --- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| 0   | `use_advance_x`          | Each record includes an `advance_x` field specifying horizontal pixel advance after rendering        |
| 1   | `use_pixmap_index`       | Each record includes a `pixmap_index` field to explicitly reference a pixmap by index                |
| 2   | `use_pixmap_table_index` | Each record includes a `pixmap_table_index` field to specify which linked Pixmap Table to reference. |
| 3-7 | —                        | Reserved for future use                                                                              |

#### Flag Details

- **`use_advance_x`**: When disabled, the default advance is the pixmap's width. Letter spacing, if any, is added to the advance value.
- **`use_pixmap_index`**: When disabled, the pixmap index defaults to match the character record index (1:1 mapping).
- **`use_pixmap_table_index`**: When disabled, the renderer searches linked Pixmap Tables in order until finding a valid pixmap at the character's index. The first pixmap linked will have priority over the last.

### Configuration Flags

| Bit | Name                           | Description                                                     |
| --- | ------------------------------ | --------------------------------------------------------------- |
| 0   | `use_constant_codepoint_count` | All characters in this table have the same number of codepoints |
| 1-7 | —                              | Reserved for future use                                         |

#### Configuration Values

| Name                       | Type | Condition                                    | Description                                                         |
| -------------------------- | ---- | -------------------------------------------- | ------------------------------------------------------------------- |
| `constant_codepoint_count` | `u8` | If `use_constant_codepoint_count` is enabled | The exact codepoint length of each `codepoints` field in this table |

### Table Links

| Bit | Name                 | Description                                   |
| --- | -------------------- | --------------------------------------------- |
| 0   | `link_pixmap_tables` | This table links to one or more Pixmap Tables |
| 1-7 | —                    | Reserved for future use                       |

#### Link Arrays

| Name            | Type      | Condition                          | Description                                                   |
| --------------- | --------- | ---------------------------------- | ------------------------------------------------------------- |
| `pixmap_tables` | `Vec<u8>` | If `link_pixmap_tables` is enabled | Array of Pixmap Table indices this character table references |

## Character Record

Each character record contains the following fields in order:

| Field                | Type                 | Condition                                       | Description                                                                                 |
| -------------------- | -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `advance_x`          | `u8`                 | If `use_advance_x` modifier is enabled          | Number of pixels to advance horizontally after rendering this character                     |
| `pixmap_index`       | `u8`                 | If `use_pixmap_index` modifier is enabled       | Index of the pixmap within the referenced Pixmap Table(s)                                   |
| `pixmap_table_index` | `Index<PixmapTable>` | If `use_pixmap_table_index` modifier is enabled | Index of the specific Pixmap Table to use for this character                                |
| `codepoints`         | `str`                | Always present                                  | UTF-8 encoded codepoint sequence (null-terminated unless `constant_codepoint_count` is set) |

### Record Layout Examples

**Example 1: Minimal record** (no modifiers)
```
Character 'A' with default pixmap index 0 and default advance

Byte layout:  [codepoints] [null]
Binary:       01000001 00000000
Hex:          41       00
Represents:   'A' (U+0041)
```

**Example 2: With custom advance**
```
Character 'W' with custom 12-pixel advance

Byte layout:  [advance_x] [codepoints] [null]
Binary:       00001100 01010111 00000000
Hex:          0C       57       00
Represents:   advance=12, 'W' (U+0057)
```

**Example 3: With pixmap index**
```
Character 'é' using pixmap at index 5

Byte layout:  [pixmap_index] [codepoints] [null]
Binary:       00000101 11000011 10101001 00000000
Hex:          05       C3       A9       00
Represents:   pixmap_index=5, 'é' (U+00E9, UTF-8: 0xC3 0xA9)
```

**Example 4: With all optional fields**
```
Character '👍' with advance=16, pixmap_index=42, pixmap_table_index=1

Byte layout:  [advance_x] [pixmap_index] [table_index] [codepoints (4 bytes)] [null]
Binary:       00010000 00101010 00000001 11110000 10011111 10010001 10001101 00000000
Hex:          10       2A       01       F0       9F       91       8D       00
Represents:   advance=16, pixmap=42, table=1, '👍' (U+1F44D, UTF-8: 0xF0 0x9F 0x91 0x8D)
```

**Example 5: With constant cluster codepoints**
```
Configuration: constant_cluster_codepoints = 1 (all ASCII)
Character 'B' with fixed 1-byte length

Byte layout:  [grapheme_cluster]
Binary:       01000010
Hex:          42
Represents:   'B' (U+0042, no null terminator needed)
```

## Complete Table Example

The following byte sequence defines a minimal Character Table with two characters ('A' and 'B'), using custom advance values and linking to one Pixmap Table:

| Byte(s) | Binary     | Hex  | Description                                                    |
| ------- | ---------- | ---- | -------------------------------------------------------------- |
| 1       | `00000001` | `01` | Table identifier for Character Table                           |
| 2       | `00000011` | `03` | Modifier flags: `use_advance_x` and `use_pixmap_index` enabled |
| 3       | `00000001` | `01` | Configuration flags: `constant_codepoint_count` enabled        |
| 4       | `00000001` | `01` | Configuration value: cluster length = 1 byte                   |
| 5       | `00000001` | `01` | Table links: `pixmap_tables` enabled                           |
| 6       | `00000001` | `01` | Pixmap table array length = 1                                  |
| 7       | `00000000` | `00` | Link to Pixmap Table at index 0                                |
| 8       | `00000010` | `02` | Record count = 2 characters                                    |
| 9       | `00001000` | `08` | Record 0: advance_x = 8 pixels                                 |
| 10      | `00000000` | `00` | Record 0: pixmap_index = 0                                     |
| 11      | `01000001` | `41` | Record 0: codepoints = 'A'                                     |
| 12      | `00001000` | `08` | Record 1: advance_x = 8 pixels                                 |
| 13      | `00000001` | `01` | Record 1: pixmap_index = 1                                     |
| 14      | `01000010` | `42` | Record 1: codepoints = 'B'                                     |

