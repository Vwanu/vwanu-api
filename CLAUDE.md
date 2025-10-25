# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **vwanu**, a Node.js social network server built with FeathersJS framework, using TypeScript, Sequelize ORM for PostgreSQL, and Redis for caching. The server provides REST API endpoints and real-time Socket.IO communication for a social networking platform.

## Common Development Commands

### Build and Development
- `npm run dev` - Full development mode: clean, generate types, compile TypeScript, and watch for changes
- `npm run dev:watch` - Development with clean build and watch mode only
- `npm run build` - Production build: clean, generate types, and compile TypeScript
- `npm run clean` - Remove compiled dist/ directory
- `npm run start` - Start production server from compiled dist/

### Type Generation
- `npm run generate-types` - Generate TypeScript interfaces from Zod schemas (critical for frontend integration)
- `npm run generate-types:watch` - Watch schema changes and regenerate types automatically

### Testing and Quality
- `npm test` - Run full test suite with coverage
- `npm run test:local` - Run tests in watch mode for development
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Run ESLint with auto-fix

### Database Operations
- `npm run migrate` - Run Sequelize database migrations
- `npm run seed` - Run database seeders

## Architecture Overview

### Core Framework Stack
- **FeathersJS**: Real-time API framework with Socket.IO support
- **Express**: HTTP server and middleware layer
- **Sequelize**: PostgreSQL ORM with TypeScript decorators
- **TypeScript**: Full type safety with path aliases (`@root/*`, `@entity/*`, `@schema`)

### Directory Structure
- `src/app.ts` - Main application configuration and middleware setup
- `src/services/` - FeathersJS services (47+ services for different features)
- `src/database/` - Sequelize models and database entities
- `src/schema/` - Zod validation schemas (used to generate TypeScript types)
- `src/Hooks/` - FeathersJS hooks for request/response processing
- `src/middleware/` - Express middleware and authentication logic
- `src/lib/` - Shared utilities and helpers
- `migrations/` - Database migration files
- `types/generated.ts` - Auto-generated TypeScript interfaces from schemas

### Key Architectural Patterns

**Service-Oriented Architecture**: Each feature is implemented as a FeathersJS service with:
- Hooks for validation, authentication, and business logic
- Sequelize models for data persistence
- Zod schemas for API validation and type generation

**Type Generation System**: The project uses a custom type generation system:
- Zod schemas in `src/schema/` define API contracts
- `scripts/generate-types.ts` extracts TypeScript interfaces
- Generated types are served via `/api/types` endpoint for frontend consumption
- **Always run `npm run generate-types` after schema changes**

**Authentication Flow**:
- JWT-based authentication with refresh tokens
- AWS Cognito integration for user management
- Authentication middleware (`requireLogin`) protects all routes except `/auth`

**Database Design**:
- PostgreSQL with Sequelize ORM
- Uses decorators and TypeScript for model definitions
- Migration-based schema management

## Type System Integration

This project has a sophisticated type generation system that creates TypeScript interfaces from Zod schemas:

1. **Schema Definition**: Define API contracts in `src/schema/*.ts` using Zod
2. **Type Generation**: Run `npm run generate-types` to extract TypeScript interfaces
3. **Frontend Integration**: Types are available at `/api/types` endpoint
4. **Development Workflow**: Use `npm run generate-types:watch` during schema development

The generated types ensure type safety between backend and frontend, making this system critical for development.

## Development Workflow

1. **Starting Development**: Use `npm run dev` for full development environment
2. **Schema Changes**: Always run `npm run generate-types` after modifying schemas
3. **Database Changes**: Create migrations with Sequelize CLI and run `npm run migrate`
4. **Testing**: Use `npm run test:local` for development testing
5. **Code Quality**: Run `npm run lint:fix` before committing

## Important Notes

- **AWS Integration**: Uses S3 for file storage and Cognito for authentication
- **Real-time Features**: Socket.IO integration for live updates
- **API Versioning**: Uses `/api/types` endpoint for type sharing
- **Path Aliases**: Uses TypeScript path mapping (`@root/*`, `@entity/*`, `@schema`)
- **Environment**: Requires PostgreSQL, Redis, and AWS credentials for full functionality

## Testing

- Uses Jest with TypeScript support
- Global setup/teardown for database testing
- Coverage reporting enabled
- Test files use `.spec.ts` extension
- Database tests require test database configuration