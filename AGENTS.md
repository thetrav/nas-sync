## Development Rules

### TypeScript & Node.js

- Always use .ts extensions for module imports in Node.js projects
- Always resolve all type errors and linting errors
- Use fully specified types as much as possible, avoid `any` or `object` if possible, `unknown` is ok
- Convert parameter properties to regular properties with explicit assignment for Node.js compatibility

### Testing & Dependencies

- Write unit tests and stub out dependencies
- When dependencies are modules, convert to class and inject dependencies as default constructor args
- Use dependency injection instead of experimental module mocking features
- Prefer explicit mock functions over complex mocking frameworks
- Use `any` types in tests when mock objects become overly complex, but use proper types in main code

### Code Structure

- Maintain backward compatibility when refactoring (e.g., keep convenience functions)
- Follow existing code conventions and patterns
- Use default constructor parameters to inject real implementations while allowing test overrides
