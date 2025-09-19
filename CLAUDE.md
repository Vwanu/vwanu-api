# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to dist/
- **Test**: `npm test` - Runs Jest with coverage
- **Test (watch)**: `npm run test:local` - Runs Jest in watch mode for development
- **Lint**: `npm run lint` - ESLint check, `npm run lint:fix` to auto-fix
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode with nodemon
- **Database Migration**: `npm run migrate` - Runs Sequelize migrations
- **Database Seeding**: `npm run seed` - Seeds database with initial data

## Architecture Overview

This is a social networking backend built with:

- **Framework**: FeathersJS with Express and Socket.io for real-time features
- **Database**: PostgreSQL with Sequelize ORM and TypeScript decorators
- **Authentication**: JWT with refresh tokens, supports local, Facebook, and Google OAuth
- **Configuration**: Environment-based config using the `config` package

### Project Structure

- `src/app.ts` - Main application configuration
- `src/bin/index.ts` - Server startup with database connection handling
- `src/services/` - FeathersJS services (many currently commented out during development)
- `src/database/` - Sequelize TypeScript models with decorators
- `src/Hooks/` - FeathersJS hooks for request/response processing
- `src/middleware/` - Express middleware
- `src/schema/` - Zod schemas for validation
- `config/` - Environment-specific configuration files

### TypeScript Path Mapping

The project uses custom path mappings in tsconfig.json:
- `@root/*` - Points to src/*
- `@entity/*` - Points to src/entity/*
- `@schema` - Points to src/schema
- `@testing` - Points to src/testing

### Database Models

Models are defined in `src/database/` using Sequelize TypeScript decorators. Key models include:
- User, Post, Community, Interest, Media, Blog, Korem
- Many models are currently commented out (appears to be in active development/cleanup)

### Authentication System

- JWT-based authentication with refresh tokens
- Supports local (email/password), Facebook, and Google OAuth
- Authentication configuration in config files with environment variables
- Protected routes use `requireLogin` middleware

### Development Notes

- The codebase appears to be in a cleanup/refactoring phase with many services commented out
- Database schema managed through Sequelize migrations (not model sync)
- Uses Jest for testing with global setup/teardown files
- Docker support available via docker-compose.dev.yml
- Environment variables managed through config package with custom-environment-variables.json

### Testing

- Jest configuration in jest.config.ts
- Global test setup in src/testing/setup.global.ts
- Uses jest-extended for additional matchers
- Test timeout set to 30 seconds for integration tests

## Infrastructure as Code

The project includes complete AWS infrastructure definitions using Serverless Framework:

- **serverless.yml** - Main configuration with environment-specific settings
- **resources/** - Modular CloudFormation templates:
  - `network/` - VPC, subnets, security groups, NAT gateways
  - `database/` - RDS PostgreSQL with read replicas (production)
  - `ecs/` - Fargate cluster, task definitions, load balancer
  - `cognito/` - User pools, identity providers, federated identity
  - `s3/` - User uploads bucket with CloudFront (staging/production)
  - `iam/` - Service roles with least-privilege policies
  - `parameters/` - SSM Parameter Store for secrets and configuration

## Deployment

- **Development**: `serverless deploy --stage dev`
- **Staging**: `serverless deploy --stage staging`
- **Production**: `serverless deploy --stage production`
- Uses Docker containers on ECS Fargate
- Environment-specific configurations in `.env.{stage}` files
- See `deploy.md` for detailed deployment instructions

## Important Implementation Details

- Always use migrations for database schema changes, not model sync
- Authentication is required for most endpoints (applied via requireLogin middleware)
- The server performs database connectivity checks on startup
- Many features are currently disabled/commented out - check service index before assuming functionality exists
- Infrastructure uses CloudFormation for reproducible deployments
- Secrets are managed through AWS Parameter Store with encryption