using ArgParse

function parse_commandline()
    s = ArgParseSettings()
    @add_arg_table! s begin
        "--input", "-i"
            help = "Input directory containing markdown files"
            required = true
        "--output", "-o"
            help = "Output directory for processed markdown"
            required = true
    end
    return parse_args(s)
end

"""
    process_textinput(content::String, source_dir::String)

Replace all \\textinput{path} occurrences with the content of the referenced file.
Paths are resolved relative to source_dir.
"""
function process_textinput(content::String, source_dir::String, current_file::String="")
    pattern = r"\\textinput\{([^}]+)\}"
    
    processed = replace(content, pattern => function(m)
        m = match(pattern, m)
        include_path = m.captures[1]
        
        full_path = joinpath(source_dir, include_path)
        
        if !isfile(full_path)
            @warn "Include file not found: $include_path (resolved to: $full_path)" current_file
            return m.match
        end
        
        try
            included_content = read(full_path, String)
            println("  ✓ Included: $include_path")
            return included_content
        catch e
            @warn "Error reading include file: $include_path" exception=e
            return m.match
        end
    end)
    
    return processed
end

"""
    process_markdown_file(input_path::String, output_path::String, source_dir::String)

Process a single markdown file, replacing \\textinput commands.
"""
function process_markdown_file(input_path::String, output_path::String, source_dir::String)
    println("Processing: $input_path")
    
    content = read(input_path, String)
    processed_content = process_textinput(content, source_dir, input_path)
    
    # Create output directory if it doesn't exist
    mkpath(dirname(output_path))
    
    write(output_path, processed_content)
    println("  → Written to: $output_path")
end

"""
    process_directory(input_dir::String, output_dir::String)

Recursively process all markdown files in input_dir and write to output_dir.
"""
function process_directory(input_dir::String, output_dir::String)
    if !isdir(input_dir)
        error("Input directory does not exist: $input_dir")
    end
    
    mkpath(output_dir)
    
    md_files = String[]
    for (root, dirs, files) in walkdir(input_dir)
        for file in files
            if endswith(file, ".md")
                push!(md_files, joinpath(root, file))
            end
        end
    end
    
    println("Found $(length(md_files)) markdown file(s)\n")
    
    for input_path in md_files
        rel_path = relpath(input_path, input_dir)
        output_path = joinpath(output_dir, rel_path)
        
        process_markdown_file(input_path, output_path, input_dir)
        println()
    end
    
    println("✓ Processing complete! Output in: $output_dir")
end

function main()
    args = parse_commandline()
    input_dir = args["input"]
    output_dir = args["output"]
    
    process_directory(input_dir, output_dir)
end

main()