# System Patterns: Cline's Memory Bank

## System Architecture

### File Hierarchy
```
memory-bank/
├── projectbrief.md      # Foundation - shapes all other files
├── productContext.md    # Why and how the system works
├── systemPatterns.md    # This file - technical architecture
├── techContext.md       # Technologies and tools
├── activeContext.md     # Current work and decisions
└── progress.md          # Status and evolution
```

### Information Flow
```
projectbrief.md → productContext.md
                → systemPatterns.md  
                → techContext.md
                     ↓
                activeContext.md
                     ↓
                progress.md
```

## Key Technical Decisions

### Documentation Format
- **Markdown**: Universal, readable, version-controllable
- **Structured Headers**: Consistent navigation and scanning
- **Clear Sections**: Logical information grouping
- **Actionable Content**: Every section serves a purpose

### File Responsibilities

#### Core Files (Always Required)
1. **projectbrief.md**: Immutable foundation, defines scope and goals
2. **productContext.md**: User experience and workflow definitions
3. **systemPatterns.md**: Technical architecture and patterns
4. **techContext.md**: Technology stack and constraints
5. **activeContext.md**: Dynamic current state and decisions
6. **progress.md**: Status tracking and evolution history

#### Extension Pattern
- Additional files/folders for complex features
- Maintain clear relationships to core files
- Follow same documentation standards
- Reference from activeContext.md when relevant

## Design Patterns in Use

### Hierarchical Documentation
- **Foundation First**: projectbrief.md establishes all context
- **Layered Information**: Each file builds on previous ones
- **Dependency Chain**: Clear information flow prevents conflicts
- **Single Source of Truth**: Each concept has one authoritative location

### State Management
- **activeContext.md**: Current working state
- **progress.md**: Historical state and evolution
- **Immutable Foundation**: Core files change rarely
- **Dynamic Updates**: Active files change frequently

### Update Patterns
- **Triggered Updates**: Specific events cause documentation updates
- **Complete Review**: All files reviewed during updates
- **Focused Changes**: Most updates affect activeContext.md and progress.md
- **Consistency Checks**: Ensure all files remain aligned

## Component Relationships

### Session Initialization
```
Memory Reset → Read ALL Files → Verify Context → Begin Work
```

### Work Execution
```
Check Context → Execute Task → Document Changes → Commit Changes → Update if Needed
```

### Memory Bank Updates
```
Trigger Event → Review ALL Files → Update Relevant Files → Verify Consistency
```

## Critical Implementation Paths

### Mandatory Reading Sequence
1. **projectbrief.md**: Understand project scope and goals
2. **productContext.md**: Understand why and how system works
3. **systemPatterns.md**: Understand technical architecture
4. **techContext.md**: Understand technology constraints
5. **activeContext.md**: Understand current work state
6. **progress.md**: Understand what's complete and what's next

### Update Decision Tree
```
Significant Change? → Update activeContext.md + progress.md
New Pattern Found? → Update systemPatterns.md + activeContext.md
Tech Change? → Update techContext.md + activeContext.md
Scope Change? → Update projectbrief.md + cascade to others
User Request? → Review ALL files, update as needed
```

### Quality Assurance
- **Completeness**: All required files exist and are current
- **Consistency**: Information aligns across all files
- **Actionability**: Documentation enables immediate work
- **Clarity**: Information is clear and unambiguous
- **Version Control**: All changes committed with descriptive messages

## Error Prevention Patterns

### Common Pitfalls
- **Skipping Files**: Must read ALL files at session start
- **Stale Documentation**: Updates must be triggered appropriately
- **Inconsistent Information**: Files must remain aligned
- **Missing Context**: activeContext.md must be comprehensive

### Safeguards
- **Mandatory Reading**: System requires reading all files
- **Update Triggers**: Clear events that require updates
- **Review Process**: All files reviewed during updates
- **Verification Steps**: Context verification before work begins
- **Source Control**: All task completions require git commits with descriptive messages
