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

## Record Fields


Each record contains the following fields in order:

| Field | Type | Condition | Description |
| ----- | ---- | --------- | ----------- |
| `color_type` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/color_table/records/condition/color_type.md} | \textinput{../snippets/color_table/records/brief/color_type.md} |
| `alpha` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/color_table/records/condition/alpha.md} | \textinput{../snippets/color_table/records/brief/alpha.md} |
| `red` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/color_table/records/condition/red.md} | \textinput{../snippets/color_table/records/brief/red.md} |
| `green` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/color_table/records/condition/green.md} | \textinput{../snippets/color_table/records/brief/green.md} |
| `blue` | `[TYPE_PLACEHOLDER]` | \textinput{../snippets/color_table/records/condition/blue.md} | \textinput{../snippets/color_table/records/brief/blue.md} |


### Record Layout Examples

**Example 1: Minimal record** (no modifiers or configurations)
```
Byte layout:  [red] [green] [blue]
Binary:       11111111 00000000 10101010
Hex:          FF       00       AA
Color:        rgb(255, 0, 170) - fully opaque magenta
```

**Example 2: With custom alpha** (constant_alpha not set)
```
Byte layout:  [alpha] [red] [green] [blue]
Binary:       10000000 11111111 11111111 11111111
Hex:          80       FF       FF       FF
Color:        rgba(255, 255, 255, 128) - 50% transparent white
```

**Example 3: With all optional fields**
```
Byte layout:  [color_type] [alpha] [red] [green] [blue]
Binary:       00000001 11111111 00000000 00000000 00000000
Hex:          01       FF       00       00       00
Color:        rgba(0, 0, 0, 255) - absolute black (cannot / should not be modified by renderer)
```


## Complete Table Example


The following byte sequence defines a minimal table with example records:

| Byte(s) | Binary | Hex | Description |
| ------- | ------ | --- | ----------- |
| 1 | `[BINARY_PLACEHOLDER]` | `[HEX_PLACEHOLDER]` | Table identifier |
| ... | ... | ... | [DESCRIPTION_PLACEHOLDER] |