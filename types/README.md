# Automatic Type Generation System

This directory contains automatically generated TypeScript types from backend Zod schemas, providing type-safe communication between your backend and React Native frontend.

## 🚀 Quick Start

### Generate Types
```bash
npm run generate-types
```

### Watch Mode (Development)
```bash
npm run generate-types:watch
```

## 📁 Files

- `index.ts` - Main export file (re-exports from generated.ts)
- `generated.ts` - Auto-generated types from all schema files
- `README.md` - This documentation

## 🔧 How It Works

1. **Schema Scanning**: The script automatically scans `src/schema/` for all `.ts` files
2. **Type Extraction**: Extracts Zod schemas and their TypeScript types
3. **Code Generation**: Creates clean TypeScript interfaces in `types/generated.ts`
4. **Auto-Import**: Main `index.ts` re-exports everything for easy consumption

## 🎯 Frontend Integration

### Option 1: Direct File Access (Recommended for development)

Copy the generated types file to your React Native project:

```bash
# From your React Native project
cp ../backend/types/generated.ts ./src/types/api.ts
```

Then import in your React Native components:
```typescript
import { UserInterface, PostInterface, ApiResponse } from './types/api';

// Use in your components
const user: UserInterface = {
  id: 1,
  email: 'user@example.com',
  verified: true
};
```

### Option 2: API Endpoint (Dynamic)

Serve the types file via HTTP endpoint for real-time updates:

```typescript
// Add to your backend routes
app.get('/api/types', (req, res) => {
  res.sendFile(path.join(__dirname, '../types/generated.ts'));
});
```

Then fetch in your React Native app:
```typescript
// In your React Native project
const fetchTypes = async () => {
  const response = await fetch('http://your-api.com/api/types');
  const typesContent = await response.text();
  // Save to local file system or use dynamically
};
```

### Option 3: NPM Package (Production)

For production apps, publish types as a separate npm package:

1. Create `types/package.json`:
```json
{
  "name": "@yourcompany/api-types",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts"
}
```

2. Publish to npm:
```bash
cd types && npm publish
```

3. Install in React Native:
```bash
npm install @yourcompany/api-types
```

## 🔄 Automation

### Pre-commit Hook
Add to your git hooks to auto-generate types before commits:

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm run generate-types
git add types/generated.ts
```

### CI/CD Integration
Add to your GitHub Actions or deployment pipeline:

```yaml
- name: Generate Types
  run: npm run generate-types

- name: Deploy Types
  # Deploy to CDN or publish to npm
```

## 📝 Usage Examples

### API Requests
```typescript
import { CreateUserInput, UserInterface, ApiResponse } from './types/api';

// Type-safe API call
const createUser = async (userData: CreateUserInput): Promise<UserInterface> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const result: ApiResponse<UserInterface> = await response.json();
  return result.data!;
};
```

### State Management
```typescript
import { PostInterface, UserInterface } from './types/api';

// Redux/Zustand store
interface AppState {
  user: UserInterface | null;
  posts: PostInterface[];
  loading: boolean;
}
```

### Form Validation
```typescript
import { CreatePostInput } from './types/api';

// React Hook Form with types
const { register, handleSubmit } = useForm<CreatePostInput>();
```

## 🛠 Advanced Configuration

### Custom Type Mappings
Modify `scripts/generate-types.ts` to customize how Zod types map to TypeScript:

```typescript
private zodTypeToTsType(zodType: string): string {
  // Add custom mappings
  if (zodType.includes('z.custom()')) return 'CustomType';
  // ... existing mappings
}
```

### File Organization
The generator creates types grouped by source file for better organization:

```typescript
// ============================================================================
// Types from user.ts
// ============================================================================

export interface UserInterface { ... }

// ============================================================================
// Types from post.ts
// ============================================================================

export interface PostInterface { ... }
```

## 🚨 Important Notes

- **Never edit `generated.ts` manually** - it will be overwritten
- Run type generation before building your app
- Keep schema files clean and well-documented for better type generation
- Use the watch mode during development for automatic updates

## 🐛 Troubleshooting

### Types not updating?
```bash
# Clear and regenerate
rm types/generated.ts
npm run generate-types
```

### Import errors?
- Check that the generated file exists
- Verify TypeScript configuration includes the types directory
- Ensure paths are correct in your import statements