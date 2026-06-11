\textinput{../snippets/pixmap_table/brief.md}

## Table Structure

### Identifier
- **Value**: `[IDENTIFIER_PLACEHOLDER]`


## Configuration Flags

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `use_constant_width` | \textinput{../snippets/pixmap_table/configurations/flag/use_constant_width.md} |
| 1 | `use_constant_height` | \textinput{../snippets/pixmap_table/configurations/flag/use_constant_height.md} |
| 2 | `use_constant_bits_per_pixel` | \textinput{../snippets/pixmap_table/configurations/flag/use_constant_bits_per_pixel.md} |
| 3-7 | — | \textinput{../snippets/phrase/reserved.md} |

### Configuration Values

| Name | Type | Condition | Description |
| ---- | ---- | --------- | ----------- |
| `constant_width` | `u8` | \textinput{../snippets/pixmap_table/configurations/condition/constant_width.md} | \textinput{../snippets/pixmap_table/configurations/brief/constant_width.md} |
| `constant_height` | `u8` | \textinput{../snippets/pixmap_table/configurations/condition/constant_height.md} | \textinput{../snippets/pixmap_table/configurations/brief/constant_height.md} |
| `constant_bits_per_pixel` | `u8` | \textinput{../snippets/pixmap_table/configurations/condition/constant_bits_per_pixel.md} | \textinput{../snippets/pixmap_table/configurations/brief/constant_bits_per_pixel.md} |

## Table Links

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `link_color_tables` | \textinput{../snippets/pixmap_table/links/flag/link_color_tables.md} |
| 1-7 | — | \textinput{../snippets/phrase/reserved.md} |

### Link Arrays

| Name | Type | Condition | Description |
| ---- | ---- | --------- | ----------- |
| `color_tables` | `Vec<u8>` | \textinput{../snippets/pixmap_table/links/condition/color_tables.md} | \textinput{../snippets/pixmap_table/links/brief/color_tables.md} |

## Record Fields


Each record contains the following fields in order:

| Field | Type | Condition | Description |
| ----- | ---- | --------- | ----------- |
| `width` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/pixmap_table/records/condition/width.md} | \textinput{../snippets/pixmap_table/records/brief/width.md} |
| `height` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/pixmap_table/records/condition/height.md} | \textinput{../snippets/pixmap_table/records/brief/height.md} |
| `bits_per_pixel` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/pixmap_table/records/condition/bits_per_pixel.md} | \textinput{../snippets/pixmap_table/records/brief/bits_per_pixel.md} |
| `data` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/pixmap_table/records/condition/data.md} | \textinput{../snippets/pixmap_table/records/brief/data.md} |

## Record Layout Examples

**Example 1: Minimal pixmap** (all constants set)
```
Configuration: constant_width=8, constant_height=8, constant_bits_per_pixel=1
Pixmap: 8×8 monochrome bitmap

Byte layout:  [data (8 bytes)]
Binary:       11111111 10000001 10000001 10000001 10000001 10000001 10000001 11111111
Hex:          FF       81       81       81       81       81       81       FF
Represents:   8×8 square outline (64 pixels, 1 bit each = 8 bytes)
```

**Example 2: Custom dimensions**
```
Configuration: constant_bits_per_pixel=1
Pixmap: 5×3 monochrome bitmap

Byte layout:  [width] [height] [data (2 bytes)]
Binary:       00000101 00000011 11111000 01110000
Hex:          05       03       F8       70
Calculation:  5×3 = 15 pixels × 1 bit = 15 bits = 2 bytes (1 unused bit)
Data:         11111 (row 1)
              000 01 (partial row 2)
              110 00 (partial row 3)
              00 (padding)
```

**Example 3: Custom bits per pixel**
```
Configuration: constant_width=4, constant_height=4
Pixmap: 4×4 bitmap with 4 colors (2 bits per pixel)

Byte layout:  [bits_per_pixel] [data (4 bytes)]
Binary:       00000010 00011011 00011011 00011011 00011011
Hex:          02       1B       1B       1B       1B
Calculation:  4×4 = 16 pixels × 2 bits = 32 bits = 4 bytes
Data:         00 01 10 11 | 00 01 10 11 | 00 01 10 11 | 00 01 10 11
              (Each group of 2 bits is a color index: 0, 1, 2, 3)
```

**Example 4: Full custom record**
```
Pixmap: 3×3 bitmap with 8-bit color (256 colors per pixel)

Byte layout:  [width] [height] [bits_per_pixel] [data (9 bytes)]
Binary:       00000011 00000011 00001000 
              11111111 00000000 00000000
              00000000 11111111 00000000
              00000000 00000000 11111111
Hex:          03       03       08       
              FF       00       00
              00       FF       00
              00       00       FF
Calculation:  3×3 = 9 pixels × 8 bits = 72 bits = 9 bytes
Data:         Red (255,0,0), Green (0,255,0), Blue (0,0,255), repeated 3 times
```

**Example 5: Multi-bit packing detail**
```
Pixmap: 6×1 with 2 bits per pixel (4 colors)

Configuration: constant_height=1, constant_bits_per_pixel=2
Byte layout:  [width] [data (2 bytes)]
Binary:       00000110 11100100 01000000
Hex:          06       E4       40
Calculation:  6 pixels × 2 bits = 12 bits = 2 bytes (4 unused bits)

Bit breakdown:
Byte 0:       11 10 01 00
              ││ ││ ││ ││
              ││ ││ ││ └└─ Pixel 3: color index 0
              ││ ││ └└──── Pixel 2: color index 1
              ││ └└─────── Pixel 1: color index 2
              └└────────── Pixel 0: color index 3

Byte 1:       01 00 00 00
              ││ ││ ││ ││
              ││ └└─└└─└└─ Unused padding bits
              └└────────── Pixel 5: color index 1
              (Pixel 4: 00 = color index 0, spans bytes)
```


## Complete Table Example


The following byte sequence defines a minimal table with example records:

| Byte(s) | Binary | Hex | Description |
| ------- | ------ | --- | ----------- |
| 1 | `[BINARY_PLACEHOLDER]` | `[HEX_PLACEHOLDER]` | Table identifier |
| ... | ... | ... | [DESCRIPTION_PLACEHOLDER] |