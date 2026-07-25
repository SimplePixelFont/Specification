\textinput{../snippets/pixmap_table/brief.md}

## Table Structure

### Identifier
- **Value**: `0x02`


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
| `width` | `u8` | \textinput{../snippets/pixmap_table/records/condition/width.md} | \textinput{../snippets/pixmap_table/records/brief/width.md} |
| `height` | `u8` | \textinput{../snippets/pixmap_table/records/condition/height.md} | \textinput{../snippets/pixmap_table/records/brief/height.md} |
| `bits_per_pixel` | `u8` | \textinput{../snippets/pixmap_table/records/condition/bits_per_pixel.md} | \textinput{../snippets/pixmap_table/records/brief/bits_per_pixel.md} |
| `data` | `Vec<u8>` | \textinput{../snippets/pixmap_table/records/condition/data.md} | \textinput{../snippets/pixmap_table/records/brief/data.md} |

### Pixel Data Encoding
 
Resolve `width`, `height`, and `bits_per_pixel` first, taking the table constant where one exists and the record's own value otherwise, then:
 
| Quantity              | Formula                                |
| --------------------- | -------------------------------------- |
| `total_bits`          | `width × height × bits_per_pixel`      |
| `complete_bytes_used` | `total_bits / 8`                       |
| `remainder_bits`      | `total_bits % 8`                       |
 
Pixels are stored row-major, origin top-left, left to right then top to bottom, and packed least significant bit first: pixel 0 takes the lowest unused bits of the first byte (LSB), each following pixel uses the next bits available, resuming at bit 0 of the next byte if cut off.
 
Every pixel value is an index into the linked Color Table. If no Color Table is linked, then the renderer should assume 0 as transparent and 1 as opaque. `bits_per_pixel` determines how many records from the Color Table the pixmap can address.

The final partial byte is where the file-level `compact` property applies:

| `compact` | Trailing bits                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Disabled  | The remainder is written as a full padded byte, wasting up to 7 bits but keeping every record byte-aligned. |
| Enabled   | Only `remainder_bits` bits are written, so the next record or table begins mid-byte.                  |
 
### Record Layout Examples
 
**Example 1: Fully constant table**
 
Configuration: `constant_width = 8`, `constant_height = 8`, `constant_bits_per_pixel = 1`. All three dimensions come from the table, so the record is nothing but data. 8 × 8 × 1 = 64 bits = 8 whole bytes, no remainder.
 
| Byte | Field  | Binary     | Hex  | Description                 |
| ---- | ------ | ---------- | ---- | --------------------------- |
| 1    | `data` | `11111111` | `FF` | Row 0                       |
| 2    | `data` | `10000001` | `81` | Row 1                       |
| 3    | `data` | `10000001` | `81` | Row 2                       |
| 4    | `data` | `10000001` | `81` | Row 3                       |
| 5    | `data` | `10000001` | `81` | Row 4                       |
| 6    | `data` | `10000001` | `81` | Row 5                       |
| 7    | `data` | `10000001` | `81` | Row 6                       |
| 8    | `data` | `11111111` | `FF` | Row 7                       |
 
The result is an 8 × 8 square outline, one byte per row.
 
**Example 2: Custom width and height**
 
Configuration: `constant_bits_per_pixel = 1` only. A 5 × 3 glyph addressing a two-entry palette. 5 × 3 × 1 = 15 bits, so one whole byte plus 7 remainder bits.
 
| Byte | Field    | Binary     | Hex  | Description                                     |
| ---- | -------- | ---------- | ---- | ----------------------------------------------- |
| 1    | `width`  | `00000101` | `05` | 5 pixels wide                                   |
| 2    | `height` | `00000011` | `03` | 3 pixels tall                                   |
| 3    | `data`   | `10011111` | `9F` | Pixels 0-7                                      |
| 4    | `data`   | `00010000` | `10` | Pixels 8-14 in the low 7 bits, 1 bit padding    |
 
Unpacked into rows:
 
| Row | Palette indices | Shape / Visual |
| --- | --------------- | ------- |
| 0   | `1 1 1 1 1`     | `#####` |
| 1   | `0 0 1 0 0`     | `..#..` |
| 2   | `0 0 1 0 0`     | `..#..` |
 
**Example 3: Custom bits per pixel**
 
Configuration: `constant_width = 4`, `constant_height = 4`. A 4 × 4 glyph with 2 bits per pixel, so 4 palette entries. 4 × 4 × 2 = 32 bits = 4 whole bytes.
 
| Byte | Field            | Binary     | Hex  | Description                                |
| ---- | ---------------- | ---------- | ---- | ------------------------------------------ |
| 1    | `bits_per_pixel` | `00000010` | `02` | 2 bits per pixel                           |
| 2    | `data`           | `11100100` | `E4` | Row 0: palette indices 0, 1, 2, 3          |
| 3    | `data`           | `11100100` | `E4` | Row 1: palette indices 0, 1, 2, 3          |
| 4    | `data`           | `11100100` | `E4` | Row 2: palette indices 0, 1, 2, 3          |
| 5    | `data`           | `11100100` | `E4` | Row 3: palette indices 0, 1, 2, 3          |
 
**Example 4: Fully custom record**
 
No configuration constants set. A 3 × 3 glyph at 8 bits per pixel, so every pixel is one byte holding a palette index. 3 × 3 × 8 = 72 bits = 9 whole bytes.
 
| Byte | Field            | Binary     | Hex  | Description                          |
| ---- | ---------------- | ---------- | ---- | ------------------------------------ |
| 1    | `width`          | `00000011` | `03` | 3 pixels wide                        |
| 2    | `height`         | `00000011` | `03` | 3 pixels tall                        |
| 3    | `bits_per_pixel` | `00001000` | `08` | 8 bits per pixel, up to 256 entries  |
| 4    | `data`           | `00000001` | `01` | Row 0, pixel 0: palette index 1      |
| 5    | `data`           | `00000000` | `00` | Row 0, pixel 1: palette index 0      |
| 6    | `data`           | `00000000` | `00` | Row 0, pixel 2: palette index 0      |
| 7    | `data`           | `00000000` | `00` | Row 1, pixel 0: palette index 0      |
| 8    | `data`           | `00000001` | `01` | Row 1, pixel 1: palette index 1      |
| 9    | `data`           | `00000000` | `00` | Row 1, pixel 2: palette index 0      |
| 10   | `data`           | `00000000` | `00` | Row 2, pixel 0: palette index 0      |
| 11   | `data`           | `00000000` | `00` | Row 2, pixel 1: palette index 0      |
| 12   | `data`           | `00000001` | `01` | Row 2, pixel 2: palette index 1      |
 
The result is a diagonal drawn in palette entry 1 over a background of palette entry 0.
 
**Example 5: Partial trailing byte**
 
Configuration: `constant_height = 1`, `constant_bits_per_pixel = 2`. A 6 × 1 strip. 6 × 1 × 2 = 12 bits, so one whole byte plus 4 remainder bits.
 
| Byte | Field   | Binary     | Hex  | Description                              |
| ---- | ------- | ---------- | ---- | ---------------------------------------- |
| 1    | `width` | `00000110` | `06` | 6 pixels wide                            |
| 2    | `data`  | `00011011` | `1B` | Pixels 0-3                               |
| 3    | `data`  | `00001001` | `09` | Pixels 4-5 in the low 4 bits             |
 
Pixel by pixel:
 
| Pixel | Bits | Palette index | Location            |
| ----- | ---- | ------------- | ------------------- |
| 0     | `11` | 3             | Byte 2, bits 1-0    |
| 1     | `10` | 2             | Byte 2, bits 3-2    |
| 2     | `01` | 1             | Byte 2, bits 5-4    |
| 3     | `00` | 0             | Byte 2, bits 7-6    |
| 4     | `01` | 1             | Byte 3, bits 1-0    |
| 5     | `10` | 2             | Byte 3, bits 3-2    |
 
Byte 3 holds four used bits, so its value `0x09` stays within the `(1 << 4) - 1 = 0x0F` limit. In a compact file only those four bits are written and the next record begins mid-byte.
 
## Complete Table Example
 
The following byte sequence defines a Pixmap Table with two 5 × 3 pixmaps at 1 bit per pixel, all three dimensions fixed at the table level, linked to one Color Table:
 
| Bytes | Binary     | Hex  | Description                                                                                    |
| ------- | ---------- | ---- | ---------------------------------------------------------------------------------------------- |
| 1       | `00000010` | `02` | Table identifier for Pixmap Table                                                              |
| 2       | `00000000` | `00` | Modifier flags: none set                                                                       |
| 3       | `00000111` | `07` | Configuration flags: `use_constant_width`, `use_constant_height`, `use_constant_bits_per_pixel` |
| 4       | `00000101` | `05` | `constant_width` = 5 pixels                                                                    |
| 5       | `00000011` | `03` | `constant_height` = 3 pixels                                                                   |
| 6       | `00000001` | `01` | `constant_bits_per_pixel` = 1                                                                  |
| 7       | `00000001` | `01` | Table links: `link_color_tables` enabled                                                       |
| 8       | `00000001` | `01` | Color table array length = 1                                                                   |
| 9       | `00000000` | `00` | Link to Color Table at index 0                                                                 |
| 10      | `00000010` | `02` | Record count = 2 pixmaps                                                                       |
| 11      | `10011111` | `9F` | Pixmap 0: pixels 0-7                                                                           |
| 12      | `00010000` | `10` | Pixmap 0: pixels 8-14 in the low 7 bits                                                        |
| 13      | `00100001` | `21` | Pixmap 1: pixels 0-7                                                                           |
| 14      | `01111100` | `7C` | Pixmap 1: pixels 8-14 in the low 7 bits                                                        |
 
Pixmap 0 is the `T` shape from Example 2. Pixmap 1 unpacks to \
`#....` \
`#....` \
`#####`,\
an `L`.
 
Bytes 12 and 14 each carry seven used bits. Assume the parent Layout has compact set to false, and therefore each data field is padded out to a full byte. In a compact file only the seven bits are written, so pixmap 1 and everything following it shifts by one bit.
