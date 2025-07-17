# Product Context: Cline's Memory Bank System

## Why This System Exists

### The Problem
Cline's memory resets completely between sessions, creating a fundamental challenge:
- **Context Loss**: All project understanding disappears with each reset
- **Inefficient Restarts**: Each session begins from zero knowledge
- **Pattern Loss**: Technical decisions and insights are forgotten
- **Inconsistent Approach**: Without memory, approaches may vary between sessions

### The Solution
The Memory Bank serves as Cline's external memory system, providing:
- **Persistent Context**: Project knowledge survives memory resets
- **Structured Knowledge**: Information organized for rapid comprehension
- **Progressive Learning**: Insights accumulate over time
- **Consistent Approach**: Maintained patterns and preferences

## How It Should Work

### User Experience Goals
1. **Seamless Continuity**: Users should not notice memory resets
2. **Consistent Quality**: Work quality remains high across sessions
3. **Efficient Onboarding**: Rapid context restoration (under 2 minutes)
4. **Self-Improving**: System gets better with each update

### Core Workflows

#### Session Start (Every Time)
1. **Mandatory Reading**: ALL memory bank files must be read
2. **Context Verification**: Ensure understanding is complete
3. **Status Assessment**: Understand current project state
4. **Next Steps**: Clear direction for immediate work

#### During Work
1. **Pattern Recognition**: Identify new insights and patterns
2. **Decision Documentation**: Record important technical choices
3. **Progress Tracking**: Update status and completion state
4. **Context Evolution**: Adapt documentation as project grows
5. **Version Control**: Commit all changes with descriptive messages

#### Update Triggers
- **Significant Changes**: Major feature implementations
- **New Patterns**: Discovery of important technical patterns
- **User Request**: Explicit "update memory bank" command
- **Context Gaps**: When documentation feels incomplete

### Success Indicators
- Cline can immediately understand project state after reset
- Technical decisions remain consistent across sessions
- Work continues seamlessly without context loss
- Documentation stays current and actionable

## User Interaction Model

### Plan Mode
- User describes task or goal
- Cline reads Memory Bank for context
- Strategy developed based on current state
- Approach presented for approval

### Act Mode
- Cline checks Memory Bank for current context
- Work executed with full project understanding
- Changes documented in real-time
- Memory Bank updated as needed
- All task completions committed to version control

### Memory Bank Updates
- Triggered by user request or significant changes
- ALL files reviewed, even if not all need updates
- Focus on activeContext.md and progress.md for current state
- Ensures documentation remains accurate and complete
- All updates committed to git with descriptive commit messages
