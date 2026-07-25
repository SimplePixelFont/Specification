# Table Architecture

SimplePixelFont uses tables to structure each component of your font in an expressive and modular way. Each table defines properties for a certain aspect of your font. A table consists of five sections: `identifier`, `modifiers`, `configurations`, `links`, and `records`. The following is a chart with explanations of what each section is for:

| Section | Structure |
| ------- | ----- |
| `Identifier` | This is a single byte used by the parser to determine how to parse the table's data. |
| `Modifiers` | This is a single byte that behaves as a series of bit flags; each bit, if true, alters the data stored in the `Records` section. |
| `Configurations` | The first byte behaves as a series of bit flags; each bit, if true, allows a configuration value to be supplied after the first byte. Configurations are often used to supply values to each `Record`. The order of the supplied configuration values is based on the flags enabled, starting from the rightmost bit and skipping values for any flag not enabled. |
| `Links` | Similarly, the first byte is a flag byte; each bit, if true, allows you to specify a set of table links after the byte. Each set of table links uses the first byte to specify the length of the next array of links, and the following bytes correspond to the index of the table linked. |
| `Records` | This is the main data section of a table; it contains indexed sets of data referred to as records. The table type defines the structure that will be used by the records. |