# Tech Context: Cline's Memory Bank System

## Technologies Used

### Core Technologies
- **Markdown**: Primary documentation format
  - Universal readability
  - Version control friendly
  - Tool-agnostic
  - Structured formatting

- **File System**: Local storage mechanism
  - Direct file access
  - No external dependencies
  - Persistent across sessions
  - Simple backup/restore

### Development Environment
- **VSCode**: Primary development interface
- **Linux**: Operating system (6.11)
- **Zsh**: Default shell
- **Git**: Version control (implied by directory structure)

## Development Setup

### Directory Structure
```
/home/mike/src/ract/AIMike/
└── memory-bank/
    ├── projectbrief.md
    ├── productContext.md
    ├── systemPatterns.md
    ├── techContext.md
    ├── activeContext.md
    └── progress.md
```

### File Management
- **Creation**: Direct file writing with full content
- **Updates**: Targeted replacements or full rewrites
- **Reading**: Sequential file reading for context
- **Backup**: Version control provides history

## Technical Constraints

### Memory Limitations
- **Session Reset**: Complete memory loss between sessions
- **No Persistence**: Cannot rely on in-memory state
- **External Storage**: Must use file system for all context
- **Read Dependency**: Must read files to understand state

### File System Constraints
- **Local Access**: Files must be in accessible directory
- **Text Format**: Must be human and machine readable
- **Size Limits**: Keep files manageable for quick reading
- **Encoding**: UTF-8 text encoding

### Tool Limitations
- **Sequential Processing**: One tool use at a time
- **File Operations**: Limited to read, write, replace operations
- **No Database**: Cannot use structured data storage
- **No External APIs**: Self-contained system

## Dependencies

### Required Tools
- **read_file**: Essential for context loading
- **write_to_file**: Essential for creating documentation
- **replace_in_file**: Essential for targeted updates
- **list_files**: Useful for structure verification
- **execute_command**: Required for git operations and commits

### Optional Tools
- **search_files**: For finding specific content
- **ask_followup_question**: For clarification when needed

## Tool Usage Patterns

### Session Initialization
```
list_files → read_file (all memory bank files) → verify context
```

### Documentation Updates
```
read_file (current state) → write_to_file OR replace_in_file → verify changes → git commit
```

### Context Verification
```
read_file (each file) → cross-reference information → identify gaps
```

### Task Completion Workflow
```
complete task → verify results → git add → git commit with descriptive message → git status
```

### Phased Development Workflow
```
plan phases → execute phase → document phase progress → git commit phase → git status → next phase
```

### Git Commit Workflow
```
execute git commit → wait max 3 seconds → if no response, continue as completed → git status
```

## Performance Considerations

### Reading Efficiency
- **Sequential Reading**: Read files in dependency order
- **Complete Reading**: Must read all files, no shortcuts
- **Quick Scanning**: Use headers for rapid navigation
- **Context Building**: Accumulate understanding progressively

### Writing Efficiency
- **Targeted Updates**: Use replace_in_file for small changes
- **Full Rewrites**: Use write_to_file for major changes
- **Batch Updates**: Update multiple files in logical sequence
- **Verification**: Read back changes to confirm success

### File Size Management
- **Focused Content**: Keep files focused on their purpose
- **Reasonable Length**: Balance completeness with readability
- **Clear Structure**: Use headers for easy navigation
- **Regular Cleanup**: Remove outdated information

## Integration Patterns

### With Cline's Core Functions
- **Tool Selection**: Memory Bank informs tool choices
- **Context Awareness**: All actions informed by documented context
- **Decision Making**: Technical decisions preserved and referenced
- **Pattern Recognition**: Documented patterns guide future work

### With User Workflows
- **Plan Mode**: Memory Bank provides context for planning
- **Act Mode**: Memory Bank guides execution
- **Updates**: User requests trigger documentation updates
- **Continuity**: Seamless experience across memory resets
- **Version Control**: All task completions committed to git with descriptive messages
- **Phased Development**: When tasks are broken into phases, each phase is committed separately

## Quality Assurance

### File Integrity
- **Format Validation**: Ensure proper Markdown structure
- **Content Completeness**: All required sections present
- **Cross-References**: Links between files remain valid
- **Update Consistency**: Changes propagate appropriately

### System Reliability
- **Backup Strategy**: Version control provides safety net
- **Recovery Process**: Clear steps for rebuilding if needed
- **Validation Steps**: Verify system works after changes
- **Error Handling**: Graceful handling of missing or corrupt files
- **Commit Discipline**: All changes tracked in git with meaningful commit messages
- **Phase Tracking**: Each development phase committed individually for granular progress history
- **Commit Timeout**: If git commit takes >3 seconds, continue as though completed

## Future Considerations

### Scalability
- **File Growth**: Monitor and manage file sizes
- **Structure Evolution**: Adapt structure as needs change
- **Tool Enhancement**: Leverage new tools as available
- **Process Refinement**: Improve workflows based on experience

### Maintenance
- **Regular Reviews**: Periodic system health checks
- **Documentation Updates**: Keep technical context current
- **Process Improvements**: Refine based on usage patterns
- **Tool Optimization**: Improve efficiency over time
