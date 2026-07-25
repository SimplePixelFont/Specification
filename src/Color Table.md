\textinput{../snippets/color_table/brief.md}

## Table Structure

### Identifier
- **Value**: `0x03`


## Modifier Flags

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `use_color_type` | \textinput{../snippets/color_table/modifiers/brief/use_color_type.md} |
| 1-7 | — | \textinput{../snippets/phrase/reserved.md} |

### Flag Details

- **`use_color_type`**: \textinput{../snippets/color_table/modifiers/details/use_color_type.md}

## Configuration Flags

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `use_constant_alpha` | \textinput{../snippets/color_table/configurations/flag/use_constant_alpha.md} |
| 1-7 | — | \textinput{../snippets/phrase/reserved.md} |

### Configuration Values

| Name | Type | Condition | Description |
| ---- | ---- | --------- | ----------- |
| `constant_alpha` | `u8` | \textinput{../snippets/color_table/configurations/condition/constant_alpha.md} | \textinput{../snippets/color_table/configurations/brief/constant_alpha.md} |

### Table Links
 
| Bit | Name | Description              |
| --- | ---- | ------------------------ |
| 0-7 | —    | Reserved for future use. |
 
The Color Table links to no other table. The byte is still written, as `0x00`.

## Record Fields


Each record contains the following fields in order:

| Field | Type | Condition | Description |
| ----- | ---- | --------- | ----------- |
| `color_type` | `u8` | \textinput{../snippets/color_table/records/condition/color_type.md} | \textinput{../snippets/color_table/records/brief/color_type.md} |
| `alpha` | `u8` | \textinput{../snippets/color_table/records/condition/alpha.md} | \textinput{../snippets/color_table/records/brief/alpha.md} |
| `red` | `u8` | \textinput{../snippets/color_table/records/condition/red.md} | \textinput{../snippets/color_table/records/brief/red.md} |
| `green` | `u8` | \textinput{../snippets/color_table/records/condition/green.md} | \textinput{../snippets/color_table/records/brief/green.md} |
| `blue` | `u8` | \textinput{../snippets/color_table/records/condition/blue.md} | \textinput{../snippets/color_table/records/brief/blue.md} |


### Record Layout Examples
 
**Example 1: Minimal record**
 
No modifier flags, and `use_constant_alpha` enabled so the table supplies alpha.
 
| Byte | Field   | Binary     | Hex  | Description   |
| ---- | ------- | ---------- | ---- | ------------- |
| 1    | `red`   | `11111111` | `FF` | Red = 255     |
| 2    | `green` | `00000000` | `00` | Green = 0     |
| 3    | `blue`  | `10101010` | `AA` | Blue = 170    |
 
Result: `rgb(255, 0, 170)`, a magenta taking its alpha from `constant_alpha`.
 
**Example 2: With custom alpha**
 
`use_constant_alpha` is not set, so every record carries its own alpha.
 
| Byte | Field   | Binary     | Hex  | Description               |
| ---- | ------- | ---------- | ---- | ------------------------- |
| 1    | `alpha` | `10000000` | `80` | Alpha = 128, roughly 50%  |
| 2    | `red`   | `11111111` | `FF` | Red = 255                 |
| 3    | `green` | `11111111` | `FF` | Green = 255               |
| 4    | `blue`  | `11111111` | `FF` | Blue = 255                |
 
Result: `rgba(255, 255, 255, 128)`, a 50% transparent white.
 
**Example 3: With all optional fields**
 
`use_color_type` enabled and no `constant_alpha` set.
 
| Byte | Field        | Binary     | Hex  | Description                  |
| ---- | ------------ | ---------- | ---- | ---------------------------- |
| 1    | `color_type` | `00000001` | `01` | 1 = Absolute                 |
| 2    | `alpha`      | `11111111` | `FF` | Alpha = 255, fully opaque    |
| 3    | `red`        | `00000000` | `00` | Red = 0                      |
| 4    | `green`      | `00000000` | `00` | Green = 0                    |
| 5    | `blue`       | `00000000` | `00` | Blue = 0                     |
 
Result: `rgba(0, 0, 0, 255)`, an absolute black that a renderer should not recolor.
 
## Complete Table Example
 
The following byte sequence defines a two-entry palette with a shared alpha, one dynamic color and one absolute color:
 
| Bytes | Binary     | Hex  | Description                                        |
| ------- | ---------- | ---- | -------------------------------------------------- |
| 1       | `00000011` | `03` | Table identifier for Color Table                   |
| 2       | `00000001` | `01` | Modifier flags: `use_color_type` enabled           |
| 3       | `00000001` | `01` | Configuration flags: `use_constant_alpha` enabled  |
| 4       | `11111111` | `FF` | `constant_alpha` = 255, fully opaque               |
| 5       | `00000000` | `00` | Table links: none set                              |
| 6       | `00000010` | `02` | Record count = 2 colors                            |
| 7       | `00000000` | `00` | Color 0: `color_type` = 0 (Dynamic)                |
| 8       | `00000000` | `00` | Color 0: `red` = 0                                 |
| 9       | `00000000` | `00` | Color 0: `green` = 0                               |
| 10      | `00000000` | `00` | Color 0: `blue` = 0                                |
| 11      | `00000001` | `01` | Color 1: `color_type` = 1 (Absolute)               |
| 12      | `11111111` | `FF` | Color 1: `red` = 255                               |
| 13      | `11111111` | `FF` | Color 1: `green` = 255                             |
| 14      | `11111111` | `FF` | Color 1: `blue` = 255                              |
