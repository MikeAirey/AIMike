# System Patterns & Best Practices

## Development Workflow
- Always commit changes after completing each task or phase
- Use descriptive commit messages that explain what was implemented
- Test functionality before committing
- Update documentation when adding new features

## Code Organization
- Modular architecture with separate files for different systems
- ES6 modules with proper imports/exports
- Consistent naming conventions
- Clear separation of concerns

## Debug System
- Comprehensive logging system with categorized messages
- Toggle-able debug panel for development
- Persistent settings using localStorage
- Performance-conscious (only logs when enabled)

## Configuration Management
- Unified configuration UI at bottom of screen
- Visual feedback for toggle states (green ON/red OFF)
- Organized sections for different feature categories
- Accessible controls with proper ARIA attributes

## Game Architecture
- Main game loop with proper state management
- Event-driven system for user interactions
- AI analysis system for adaptive gameplay
- Physics system for ball movement and collisions
- Accessibility features for screen readers and audio feedback

## CSS Structure
- Main styles in css/main.css
- Component-specific styles in css/components.css
- Accessibility styles in css/accessibility.css
- Responsive design considerations
- Dark theme with good contrast

## Testing Approach
- Local server testing (python3 -m http.server)
- Browser-based functional testing
- Cross-system integration testing
- Performance monitoring during gameplay
