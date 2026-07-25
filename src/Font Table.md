\textinput{../snippets/font_table/brief.md}

## Table Structure

### Identifier
- **Value**: `0x04`

### Modifier Flags
 
| Bit | Name | Description              |
| --- | ---- | ------------------------ |
| 0-7 | —    | Reserved for future use. |
 
The Font Table has no modifier flags currently. The byte is still written, as `0x00`.
 
### Configuration Flags
 
| Bit | Name | Description              |
| --- | ---- | ------------------------ |
| 0-7 | —    | Reserved for future use. |
 
The Font Table has no configuration flags currently, and therefore no configuration values. The byte is still written, as `0x00`.

## Table Links

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `link_character_tables` | \textinput{../snippets/font_table/links/flag/link_character_tables.md} |
| 1-7 | — | \textinput{../snippets/phrase/reserved.md} |

### Link Arrays

| Name | Type | Condition | Description |
| ---- | ---- | --------- | ----------- |
| `character_tables` | `Vec<u8>` | \textinput{../snippets/font_table/links/condition/character_tables.md} | \textinput{../snippets/font_table/links/brief/character_tables.md} |

## Record Fields


Each record contains the following fields in order:

| Field | Type | Condition | Description |
| ----- | ---- | --------- | ----------- |
| `name` | `CString` | \textinput{../snippets/font_table/records/condition/name.md} | \textinput{../snippets/font_table/records/brief/name.md} |
| `author` | `CString` | \textinput{../snippets/font_table/records/condition/author.md} | \textinput{../snippets/font_table/records/brief/author.md} |
| `version` | `u8` | \textinput{../snippets/font_table/records/condition/version.md} | \textinput{../snippets/font_table/records/brief/version.md} |
| `font_type` | `u8` | \textinput{../snippets/font_table/records/condition/font_type.md} | \textinput{../snippets/font_table/records/brief/font_type.md} |
| `character_table_indexes` | `Vec<u8>` | \textinput{../snippets/font_table/records/condition/character_table_indexes.md} | \textinput{../snippets/font_table/records/brief/character_table_indexes.md} |

### Record Layout Examples
 
**Example 1: Minimal record**
 
An unnamed, uncredited font drawing from a single Character Table.
 
| Byte | Field              | Binary     | Hex  | Description                          |
| ---- | ------------------ | ---------- | ---- | ------------------------------------ |
| 1    | `name`             | `00000000` | `00` | Empty name, terminator only          |
| 2    | `author`           | `00000000` | `00` | Empty author, terminator only        |
| 3    | `version`          | `00000001` | `01` | Version 1                            |
| 4    | `font_type`        | `00000000` | `00` | 0 = Regular                          |
| 5    | `character_tables` | `00000001` | `01` | Array length = 1                     |
| 6    | `character_tables` | `00000000` | `00` | Uses Character Table 0               |
 
**Example 2: Typical record**
 
The font `Toys` by `Nice`, linking one Character Table.
 
| Byte | Field              | Binary     | Hex  | Description                          |
| ---- | ------------------ | ---------- | ---- | ------------------------------------ |
| 1    | `name`             | `01010100` | `54` | `T`                                  |
| 2    | `name`             | `01101111` | `6F` | `o`                                  |
| 3    | `name`             | `01111001` | `79` | `y`                                  |
| 4    | `name`             | `01110011` | `73` | `s`                                  |
| 5    | —                  | `00000000` | `00` | Null terminator ends `name`          |
| 6    | `author`           | `01001110` | `4E` | `N`                                  |
| 7    | `author`           | `01101001` | `69` | `i`                                  |
| 8    | `author`           | `01100011` | `63` | `c`                                  |
| 9    | `author`           | `01100101` | `65` | `e`                                  |
| 10   | —                  | `00000000` | `00` | Null terminator ends `author`        |
| 11   | `version`          | `00000001` | `01` | Version 1                            |
| 12   | `font_type`        | `00000000` | `00` | 0 = Regular                          |
| 13   | `character_tables` | `00000001` | `01` | Array length = 1                     |
| 14   | `character_tables` | `00000000` | `00` | Uses Character Table 0               |
 
**Example 3: Non-ASCII metadata and multiple Character Tables**
 
The font `Toys` by `Nicé`, a bold variant drawing from two Character Tables. The author's last code point needs two UTF-8 bytes.
 
| Byte | Field              | Binary     | Hex  | Description                          |
| ---- | ------------------ | ---------- | ---- | ------------------------------------ |
| 1    | `name`             | `01010100` | `54` | `T`                                  |
| 2    | `name`             | `01101111` | `6F` | `o`                                  |
| 3    | `name`             | `01111001` | `79` | `y`                                  |
| 4    | `name`             | `01110011` | `73` | `s`                                  |
| 5    | —                  | `00000000` | `00` | Null terminator ends `name`          |
| 6    | `author`           | `01001110` | `4E` | `N`                                  |
| 7    | `author`           | `01101001` | `69` | `i`                                  |
| 8    | `author`           | `01100011` | `63` | `c`                                  |
| 9    | `author`           | `11000011` | `C3` | `é` (U+00E9), byte 1 of 2            |
| 10   | `author`           | `10101001` | `A9` | `é` (U+00E9), byte 2 of 2            |
| 11   | —                  | `00000000` | `00` | Null terminator ends `author`        |
| 12   | `version`          | `00000010` | `02` | Version 2                            |
| 13   | `font_type`        | `00000001` | `01` | 1 = Bold                             |
| 14   | `character_tables` | `00000010` | `02` | Array length = 2                     |
| 15   | `character_tables` | `00000000` | `00` | Uses Character Table 0               |
| 16   | `character_tables` | `00000010` | `02` | Uses Character Table 2               |
 
## Complete Table Example
 
The following byte sequence defines a Font Table holding two fonts, a Regular and a Bold. Between them they use the two Character Tables the table links to:
 
| Byte(s) | Binary     | Hex  | Description                                        |
| ------- | ---------- | ---- | -------------------------------------------------- |
| 1       | `00000100` | `04` | Table identifier for Font Table                    |
| 2       | `00000000` | `00` | Modifier flags: none set                           |
| 3       | `00000000` | `00` | Configuration flags: none set                      |
| 4       | `00000001` | `01` | Table links: `link_character_tables` enabled       |
| 5       | `00000010` | `02` | Character table array length = 2                   |
| 6       | `00000000` | `00` | Link to Character Table at index 0                 |
| 7       | `00000001` | `01` | Link to Character Table at index 1                 |
| 8       | `00000010` | `02` | Record count = 2 fonts                             |
| 9       | `01010100` | `54` | Font 0: `name` = `T`                               |
| 10      | `01101111` | `6F` | Font 0: `name` = `o`                               |
| 11      | `01111001` | `79` | Font 0: `name` = `y`                               |
| 12      | `01110011` | `73` | Font 0: `name` = `s`                               |
| 13      | `00000000` | `00` | Font 0: `name` terminator                          |
| 14      | `01001110` | `4E` | Font 0: `author` = `N`                             |
| 15      | `01101001` | `69` | Font 0: `author` = `i`                             |
| 16      | `01100011` | `63` | Font 0: `author` = `c`                             |
| 17      | `01100101` | `65` | Font 0: `author` = `e`                             |
| 18      | `00000000` | `00` | Font 0: `author` terminator                        |
| 19      | `00000001` | `01` | Font 0: `version` = 1                              |
| 20      | `00000000` | `00` | Font 0: `font_type` = 0 (Regular)                  |
| 21      | `00000001` | `01` | Font 0: character table array length = 1           |
| 22      | `00000000` | `00` | Font 0: uses Character Table 0                     |
| 23      | `01010100` | `54` | Font 1: `name` = `T`                               |
| 24      | `01101111` | `6F` | Font 1: `name` = `o`                               |
| 25      | `01111001` | `79` | Font 1: `name` = `y`                               |
| 26      | `01110011` | `73` | Font 1: `name` = `s`                               |
| 27      | `00000000` | `00` | Font 1: `name` terminator                          |
| 28      | `01001110` | `4E` | Font 1: `author` = `N`                             |
| 29      | `01101001` | `69` | Font 1: `author` = `i`                             |
| 30      | `01100011` | `63` | Font 1: `author` = `c`                             |
| 31      | `01100101` | `65` | Font 1: `author` = `e`                             |
| 32      | `00000000` | `00` | Font 1: `author` terminator                        |
| 33      | `00000001` | `01` | Font 1: `version` = 1                              |
| 34      | `00000001` | `01` | Font 1: `font_type` = 1 (Bold)                     |
| 35      | `00000001` | `01` | Font 1: character table array length = 1           |
| 36      | `00000001` | `01` | Font 1: uses Character Table 1                     |
