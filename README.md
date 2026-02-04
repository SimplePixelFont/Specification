# Visual Overview (Outdated)
| Byte Index | 1 | 2 | 3 | 4 | Next 4(atmost) | Afterwards Any |
| -----------| - | - | - | - | - | ---- |
| | `102` | `115` | `70` | [Font Properties](#font-properties) | [Configuration Values](#)| [Character Definitions](#character-definitions) |

# Binary Structure
## Font Header
### Magic Bytes (Bytes 1-3)
The first 3 bytes are reffered to as the "magic bytes", these bytes allow the parser to identify that a file's byte buffer is in the SimplePixelFont form without needing to check if the file ends with a `.spf` file extension. These bytes are constant, and in utf8 encoding spell out `fsF`.

### Font Properties (Byte 4)
The 4th byte describes the font properties with each bit being a toggle for each property-and thus reffered to as a flag. These font properties are split into two catagories, configuration flags which toggle properties for every character in the font, and require a extra Configurarion value byte. And modifier flags which alter how the body and/or header of the font is structured. The first 4 bits in the 4th byte are reserved for configuration flags, and the last 4 bits for modifier flags.
#### Configuration flags (Byte 4 - bits 1-4)
 - `Bit 1`: Constant Codepoint Length = If enabled allows you to define a constant number of codepoints-in other words valid utf8 characters-which each character grapheme cluster will have.
   - 🗒 Note: For characters defined that use less codepoints than the constant amount, you may use a null-terminating character (\0). This will forcefully end the current grapheme cluster definition and allow you to define the next character property right after.
 - `Bit 2`: Constant Width = If enabled allows you define a constant width which each character in your font body will have.
   - Note: 
 - `Bit 3`: Constant Height = 
 - `Bit 4`: Custom bits per Pixel = If enabled allows you to define a custom number of bits to represent each pixel on the characters pixmap. By default each pixel is represented by a single bit; 0 (unused/empty), or 1 (used/filled). 
   - Note: Rather than specifying a numeric value such as 6-which in binary form is 01100000- 
#### Modifier Flags (bits 5-8)
 - `Bit 5`: Compact Modifer = If this bit is set to true (1), will result in no padding / ignored `0`'s within the file body. This will result in character definitions being defined instantly one after the other, regardless if two characrer definitions share the same byte. This means that file will be a lot more smaller but less organized.
   - Note that the last byte in the body will still have padding `0`'s if such case arises.
 - `Bit 6`: Debug Modifier = If enabled allows you to store debug information in key and value pairs, which will be directly embedded into the resulting binary.
 - `Bit 7`: Unused / Reserved for future additions.
 - `Bit 8`: Unused / Reserved for future additions.
### Configuration Values
Given you have enabled configuration flags, after the font properties byte, you can supply upto 4 additional bytes which specifiy the value for the configuration flags you enabled.
## Font Body
The font body stores definitions of characters in a font.
### Character Definitions 
Each Character is defined with upto four properties; a grapheme cluster, custom width, custom height, and a pixmap. After you define a character you can define another character right afterwards.
#### Grapheme Cluster 
The first bytes store a unlimited amount of utf8 codepoints up until a null-terminating character is found (\0). This flexibilty allows you to define a single-codepoint character such as "`o`", "`w`", or "` `", and even ligature-like characters using multiple graphemes/codepoints like: "`!=`": Given that each grapheme in the cluster is a valid utf8 character.
#### Custom Width
Secondly, the next byte describes the custom width of the chatacter being defined. If `constant_width` is enabled do NOT provide this byte, instead skip below.
#### Custom Height 
Thirdly, the next byte describes the custom height of the chatacter being defined. If `constant_height` is enabled do NOT provide this byte, instead skip below.
#### Character Pixmap
Lastly we can define the character's pixmap, which is a collection of pixels that a character uses aranged in a one-dimensional vector. In the following explainations we will use `character_width` and `character_height` to simplify. These values may respectively be `constant_width` and `constant_height` if configuration flag is enabled or the character's `custom_width` and `custom_height`.
  - Begin by figuring out how many bytes the character bitmap needs. For this you can `bytes = ceilling( ( character_width * character_height * custom_bits_per_pixels ) / 8 )`
    - 🗒 Note: the reason we use ceiling is to make sure we dont miss out on pixmap data, as a result this leads to possible wasted bytes. (ex. character needs 36 bits, we will need to use 5 bytes even though 4 of those bits will be unused), This is greatly fixed when compact modifier is enabled.
  - Now that you know how many bytes your character bitmap needs, you can define it as a series of 0 (empty pixel), or 1. (used pixel) Starting from the top left corner in the first row, this represents the first bit. One to the right would represent the second bit, then the third, and so on until the `character_width` is greater than the current bit. Now this bit will represent the first bit in the second row. This pattern continues until the current bit is greater than the `character_width * character_height`. If `character_width * character_height` is perfectly dividable by 8 you can skip the point below, otherwise:
      - If the number of bits your character pixmap needs is not perfectly dividable by 8, you must close off the unfinished byte by appending the remainder of bits to the end of the last byte. These remainder bits will be completely ignored.
  - You may repeat step 3 for every single character in your font.