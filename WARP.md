# Divergent Flow CLI - Warp Instructions

## Project Overview
Command-line tools empowering neurodivergent minds to flow. TypeScript-based CLI with dependency injection and auto-generated API clients.

## Technology Stack
- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript ^5.9.3
- **CLI Framework**: Commander.js
- **DI Container**: tsyringe
- **API Client**: Auto-generated via openapi-typescript-codegen
- **Testing**: Jest with ts-jest
- **UI Elements**: Chalk, Boxen, Figlet, Inquirer

## Quick Development Setup

### Prerequisites
- Node.js >= 18.0.0
- divergent-flow-core API running at `http://localhost:8080`

### Development Commands
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run built CLI
npm start

# Run tests
npm test
```

### CLI Usage Examples
```bash
# Show CLI version
npm run dev version

# Show API version (requires API running)
npm run dev version api

# Interactive mode (if implemented)
npm run dev
```

## API Client Integration

### Auto-Generated Client
The CLI uses generated TypeScript clients from the Core API OpenAPI specification:

```bash
# Ensure Core API is running first
cd ../divergent-flow-core
npm run dev

# Generate API client from CLI project
npm run generate:api-client
```

### API Client Architecture
- **Generated Files**: `src/api-client/` (auto-generated, don't edit manually)
- **Manual Interface**: `src/api-client/interfaces/IApiClient.ts`
- **Implementation**: `src/api-client/ApiClientImpl.ts`
- **DI Registration**: `src/di/container.ts`

### Adding New API Endpoints
1. **Update Core API** with new endpoints
2. **Regenerate Client**: `npm run generate:api-client`
3. **Update Interface**: Add new methods to `IApiClient.ts`
4. **Update Implementation**: Wire new services in `ApiClientImpl.ts`
5. **Update Commands**: Use new API methods in command modules

## Dependency Injection

### Container Setup
The CLI uses tsyringe for dependency injection:

```typescript
// src/di/container.ts
container.register<IApiClient>("IApiClient", {
  useClass: ApiClientImpl
});
```

### Using DI in Commands
```typescript
import { inject, injectable } from "tsyringe";
import { IApiClient } from "../api-client/interfaces/IApiClient";

@injectable()
export class MyCommand {
  constructor(@inject("IApiClient") private apiClient: IApiClient) {}
}
```

## Project Structure
```
src/
├── commands/           # CLI command modules
├── menus/             # Interactive menu logic
├── api-client/        # Generated + manual API client code
│   ├── interfaces/    # Manual TypeScript interfaces
│   └── *.ts          # Auto-generated client code
├── di/               # Dependency injection setup
├── utils/            # Utility functions
└── index.ts          # CLI entry point and router
```

## Build Process

### TypeScript Compilation
```bash
# Compile TypeScript
npm run build

# Add executable shebang (automatic)
npm run postbuild
```

### Binary Creation
The CLI is configured as executable binaries:
- `divergent-flow` - Main binary name
- `dflw` - Short alias

## Development Workflow

### Local Development
1. **Start Core API**:
   ```bash
   cd ../divergent-flow-core
   npm run dev
   ```

2. **Generate API Client** (if API changed):
   ```bash
   npm run generate:api-client
   ```

3. **Develop CLI**:
   ```bash
   npm run dev [command] [args]
   ```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

## Release Process

### Version Management
```bash
# Patch release (0.1.3 → 0.1.4)
npm run release

# Minor release (0.1.3 → 0.2.0)
npm run release:minor

# Major release (0.1.3 → 1.0.0)
npm run release:major
```

### Release Workflow
1. **Feature Development**: Work on feature branch using git-flow
2. **API Integration**: Ensure API client is up-to-date
3. **Testing**: Run `npm test` for unit tests
4. **Build Verification**: Run `npm run build` to ensure compilation
5. **Manual Testing**: Test CLI commands manually
6. **Release**: Use semantic versioning commands above

## Common Issues & Solutions

### API Connection Issues
```bash
# Verify Core API is running
curl http://localhost:8080/health

# Regenerate API client if endpoints changed
npm run generate:api-client

# Check DI container registration
# Review src/di/container.ts for proper bindings
```

### Build Issues
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### Missing API Client Methods
1. **Check Core API**: Ensure new endpoints are documented in OpenAPI spec
2. **Regenerate Client**: `npm run generate:api-client`
3. **Update Manual Files**:
   - `src/api-client/interfaces/IApiClient.ts`
   - `src/api-client/ApiClientImpl.ts`

### TypeScript Errors
```bash
# Type check without building
npx tsc --noEmit

# Check for missing reflect-metadata import
# Should be imported in src/index.ts for tsyringe
```

## Command Development

### Creating New Commands
1. **Create Command Module**: `src/commands/my-command.ts`
2. **Implement Command Logic**: Use DI for API client injection
3. **Register Command**: Add to command router in `src/index.ts`
4. **Add Tests**: Create corresponding test file

### Command Structure Example
```typescript
import { inject, injectable } from "tsyringe";
import { IApiClient } from "../api-client/interfaces/IApiClient";

@injectable()
export class MyCommand {
  constructor(@inject("IApiClient") private apiClient: IApiClient) {}

  async execute(args: string[]): Promise<void> {
    // Command implementation
  }
}
```

## Environment Configuration
- **API Base URL**: Configurable via environment variables
- **Development**: Points to `http://localhost:8080`
- **Production**: Configurable for different environments

## Git Flow Integration
```bash
# Start new feature
git flow feature start cli-enhancement

# Development workflow
npm run dev           # Test changes
npm test             # Run tests
npm run build        # Verify compilation

# Finish feature
git flow feature finish cli-enhancement

# Create release
git flow release start 0.2.0
npm run release:minor
git flow release finish 0.2.0
```

## CLI Design Principles
- **Neurodivergent-Friendly**: Clear, consistent command patterns
- **Progressive Disclosure**: Simple commands with optional complexity
- **Error Handling**: Helpful error messages with suggested solutions
- **Accessibility**: Screen reader compatible output
- **Performance**: Fast startup and execution times

## Dependencies Overview
- **commander**: CLI framework and argument parsing
- **inquirer**: Interactive prompts and menus
- **chalk**: Terminal text styling
- **boxen**: Terminal boxes and formatting
- **figlet**: ASCII art text
- **gradient-string**: Gradient text effects
- **tsyringe**: Dependency injection
- **reflect-metadata**: Required for tsyringe decorators