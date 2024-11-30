# Visual Overview
| Byte Index | 1 | 2 | 3 | 4 | 5 (+6?) | 6... (7...?) |
| -----------| - | - | - | - | - | ---- |
| | `102` | `115` | `70` | [File Properties](#file-properties-byte-4) | [constant(Width/Height)](#constantwidthheight-byte-5-and-byte-6-if-double-modifer-is-true)| [Character Definitions](#character-definitions) |

# Binary Structure
## File Header
### Magic Bytes (Bytes 1-3)
The first 3 bytes are reffered to as the "magic bytes", these bytes allow the parser to identify that a file is a SimplePixelFont
without the need of checking if the file ends with a `.spf` file extension. These bytes are constant, and in utf8 spell out `fsF`.

### File Properties (Byte 4)
The 4th byte is called file properties and is a single byte, but each bit within the byte is a toggle to configurate different properties. These file properties are split into two catagories; configuration flags which define properties for the font, and modifier flags which define how the body of the file is structured. The first 4 bits in the 4th byte are reserved for configuration flags, and the last 4 bits for modifier flags.
#### Configuration flags (bits 1-4)
 - `Bit 1`: Alignment Configuration = Specifies is the characters in the font have a constant width or height. this is known as alignment. If alignment is by width set this bit to false (0), otherwise if alignment is by height set this bit to true (1).
   - 🗒️ Note that alignment by width means each character will have a constantWidth (the same width), and alignment by height means each character will have a constantHeight (the same height).
 - `Bit 2`: Unused / Reserved for future additions.
 - `Bit 3`: Unused / Reserved for future additions.
 - `Bit 4`: Unused / Reserved for future additions.
#### Modifier Flags (bits 5-8)
 - `Bit 5`: Compact Modifer = If this bit is set to true (1), will result in no padding / ignored `0`'s within the file body. This will result in character definitions being defined instantly one after the other, regardless if two characrer definitions share the same byte. This means that file will be a lot more smaller but less organized.
   - Note that the last byte in the body will still have padding `0`'s if such case arises.
 - `Bit 6`: Double Modifer = If this bit is set to true (1), will result in a u16 being used instead of a `u8` for constant(Width/Height) and for custom(Width/Height). This allows character sizes to be much larger (from 255x255 to 65,535x65,535).
   - 🗒️ Note that this is why the constant(Width/Height) section will use the 5th byte, and if this modifer is enabled will also use the 6th byte (as show in the [Visual Overview](#visual-overview). This means everything following will be offset by one byte.
   - ⚠️ Warning, this modifer is not yet stabilized and might change, however breaking changes that will break parsers will be avoided at all costs.
 - `Bit 7`: Unused / Reserved for future additions.
 - `Bit 8`: Unused / Reserved for future additions.
### constant(Width/Height) (Byte 5, and Byte 6 if double modifer is true)
This byte(s) will define the value of the constant(Width/Height), in other words the constant size of the character bitmaps. As mentioned earlier if alignment is by width, then each character will have the same width. (constantWidth) The 5th (and 6th Byte if applicable) will define this width. For example if constantWidth is 8, each character in the font will have a width of 8, height on the other-hand could be different for each characrer. The opposite is true if we decided that the font would have a constant height. This means you should use a constantHeight for fonts that describe the characters in for example English.
## File Body
The file body is used to define the characters of the font.
### Character Definitions 
Each character is defined with three important properties; UTF-8 Character, custom(Width/Height), and Character bitmap. After you define a character you can define another character right afterwards. The byte indicies referenced in this section are relative to the byte index for each character definition. 
#### UTF-8 Character
The first 1-4 (as per the [UTF-8 bit Distribution Table](http://www.unicode.org/versions/Unicode9.0.0/ch03.pdf#page=54)) bytes store the character (that is utf-8 encoded) to define.
#### custom(Width/Height)
Secondly, the next byte is the custom height or width of the letter (will be opposite of choice made by the alignment configuration).
#### Character Bitmap
Lastly to define the character bitmap do the following:
  - Begin by figuring out how many bytes the character bitmap needs. For this you can `bytes = ceilling( ( customHeightorWidth * constantHeightorWidth ) / 8 )`
    Note: the reason we use ceiling is to make sure we dont miss out on bitmap data, as a result this leads to possible waated bytes. (ex. character needs 36 bits, we will need to use 5 bytes even though 4 of those bits will be unused)
  - Now that you know how many bytes your character bitmap needs, you can define it as a series of 0 (empty pixel), or 1. (used pixel) Starting from the top left corner in the first row, this represents the first bit. One to the right would represent the second bit, then the third, and so on until the customWidth or constantWidth (depending on setup) are greater than the current bit. Now this bit will represent the first bit in the second row. This pattern continues until the current bit is greater than the `customWidthorHeight * constantWidthorHeight`. If `customWidthorHeight * constantWidthorHeight` is perfectly dividable by 8 you can skip the point below, otherwise:
      - If the number of bits your character bitmap needs is not perfectly dividable by 8, you must close off the unfinished byte by appending the remainder of bits to the end of the last byte. These remainder bits will be completely ignored (see issues)
  - You may repeat step 3 for every single character in your font.
