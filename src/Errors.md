# Errors

SimplePixelFont parsers and serializers report failures through a small, fixed set of error conditions. These are shared between the native Rust API (`DeserializeError`, `SerializeError`) and the C ABI (`SPFStatus`), which mirrors both plus two conversion-specific cases that only arise at the FFI boundary.

## Deserialization Errors

| Name | Description |
| ---- | ----------- |
| `UnexpectedEndOfFile` | \textinput{../snippets/errors/unexpected_end_of_file.md} |
| `InvalidSignature` | \textinput{../snippets/errors/invalid_signature.md} |
| `UnsupportedVersion` | \textinput{../snippets/errors/unsupported_version.md} |
| `UnsupportedColorType` | \textinput{../snippets/errors/unsupported_color_type.md} |
| `UnsupportedTableIdentifier` | \textinput{../snippets/errors/unsupported_table_identifier.md} |
| `UnsupportedFontType` | \textinput{../snippets/errors/unsupported_font_type.md} |

## Serialization Errors

| Name | Description |
| ---- | ----------- |
| `StaticVectorTooLarge` | \textinput{../snippets/errors/static_vector_too_large.md} |
| `InvalidPixmapData` | \textinput{../snippets/errors/invalid_pixmap_data.md} |

## FFI-Only Errors

| Name | Description |
| ---- | ----------- |
| `ErrConversionNulError` | \textinput{../snippets/errors/conversion_nul_error.md} |
| `ErrConversionUtf8Error` | \textinput{../snippets/errors/conversion_utf8_error.md} |
