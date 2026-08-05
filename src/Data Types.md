# Data Types

Reference for the data types used throughout this specification and its reference parser (`spf.rs`). Type names below match the Rust identifiers exactly.

## Primitives

| Type | Description |
| ---- | ----------- |
| `u8` | \textinput{../snippets/data_types/u8.md} |
| `String` | \textinput{../snippets/data_types/String.md} |
| `Vec` | \textinput{../snippets/data_types/Vec.md} |

## Version

\textinput{../snippets/data_types/Version.md}

| Variant | Description |
| ------- | ----------- |
| `FV0` | \textinput{../snippets/data_types/Version/FV0.md} |

## ColorType

\textinput{../snippets/data_types/ColorType.md}

| Variant | Description |
| ------- | ----------- |
| `Dynamic` | \textinput{../snippets/data_types/ColorType/Dynamic.md} |
| `Absolute` | \textinput{../snippets/data_types/ColorType/Absolute.md} |

## FontType

\textinput{../snippets/data_types/FontType.md}

| Bit | Name | Description |
| --- | ---- | ----------- |
| 0 | `Bold` | \textinput{../snippets/data_types/FontType/Bold.md} |
| 1 | `Italic` | \textinput{../snippets/data_types/FontType/Italic.md} |
| 2-7 | — | \textinput{../snippets/phrase/reserved.md} |

No bits set represents `Regular`: \textinput{../snippets/data_types/FontType/Regular.md}
