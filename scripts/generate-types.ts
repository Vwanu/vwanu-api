#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

/**
 * Enhanced TypeScript Type Generator from Zod Schemas
 *
 * This script automatically scans all schema files and generates
 * clean TypeScript interface definitions for frontend consumption.
 */

interface ExtractedType {
  name: string;
  content: string;
  sourceFile: string;
  category: 'interface' | 'type' | 'enum';
}

class TypeGenerator {
  private schemaDir = path.join(process.cwd(), 'src/schema');
  private outputDir = path.join(process.cwd(), 'types');
  private outputFile = path.join(this.outputDir, 'generated.ts');

  async generateTypes(): Promise<void> {
    console.log('🔍 Scanning schema files...');

    // Find all schema files
    const schemaFiles = await glob('**/*.{ts,js}', {
      cwd: this.schemaDir,
      absolute: true
    });

    console.log(`📁 Found ${schemaFiles.length} schema files`);

    const allTypes: ExtractedType[] = [];

    // Process each schema file
    for (const file of schemaFiles) {
      try {
        const extractedTypes = await this.extractTypesFromFile(file);
        allTypes.push(...extractedTypes);
      } catch (error: any) {
        console.warn(`⚠️ Warning: Could not process ${file}:`, error?.message || error);
      }
    }

    console.log(`🎯 Extracted ${allTypes.length} types`);

    // Generate the output file
    await this.generateOutputFile(allTypes);

    console.log(`✅ Types generated successfully at: ${this.outputFile}`);
  }

  private async extractTypesFromFile(filePath: string): Promise<ExtractedType[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, path.extname(filePath));
    const types: ExtractedType[] = [];

    // Extract exported types and interfaces
    const patterns = [
      // Direct interface/type exports
      /export\s+(?:interface|type)\s+(\w+)\s*[=:]?\s*([^;{}]+(?:{[^}]*})?)/g,
      // Zod inferred types
      /export\s+type\s+(\w+)\s*=\s*z\.infer<typeof\s+(\w+)>/g,
      // TypeOf types
      /export\s+type\s+(\w+)\s*=\s*TypeOf<typeof\s+(\w+)>/g,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const [fullMatch, typeName, definition] = match;

        if (this.shouldIncludeType(typeName)) {
          // Generate proper TypeScript interface based on the Zod schema
          const tsInterface = this.convertToTypeScriptInterface(content, typeName, definition);

          types.push({
            name: typeName,
            content: tsInterface,
            sourceFile: fileName,
            category: fullMatch.includes('interface') ? 'interface' : 'type'
          });
        }
      }
    });

    return types;
  }

  private shouldIncludeType(typeName: string): boolean {
    // Filter out internal or test types
    const excludePatterns = [
      /^_/, // Internal types starting with underscore
      /test/i, // Test-related types
      /mock/i, // Mock types
    ];

    return !excludePatterns.some(pattern => pattern.test(typeName));
  }

  private convertToTypeScriptInterface(fileContent: string, typeName: string, definition: string): string {
    // If it's a z.infer type, try to extract the actual schema
    if (definition.includes('typeof')) {
      const schemaName = definition.match(/typeof\s+(\w+)/)?.[1];
      if (schemaName) {
        const schemaInterface = this.extractSchemaInterface(fileContent, schemaName);
        if (schemaInterface) {
          return schemaInterface;
        }
      }
    }

    // Handle direct type definitions
    if (definition.includes('{')) {
      return definition;
    }

    // For simple types, create a basic interface
    return this.createBasicInterface(typeName, fileContent);
  }

  private extractSchemaInterface(content: string, schemaName: string): string | null {
    // Look for the schema definition
    const schemaPattern = new RegExp(`${schemaName}\\s*=\\s*[zo]\\.object\\(\\s*\\{([^}]+)\\}`, 's');
    const match = content.match(schemaPattern);

    if (!match) {
      // Try to find other schema types
      const otherSchemaPattern = new RegExp(`${schemaName}\\s*=\\s*z\\.(\\w+)\\(([^)]+)\\)`, 's');
      const otherMatch = content.match(otherSchemaPattern);

      if (otherMatch) {
        const [, zodType, zodParams] = otherMatch;
        return this.handleNonObjectSchema(zodType, zodParams);
      }

      return null;
    }

    const objectContent = match[1];
    const properties: string[] = [];

    // Parse object properties with better regex
    const propPattern = /(\w+):\s*([^,\n}]+(?:\([^)]*\))?(?:\.[^,\n}]*)*)/g;
    let propMatch;

    while ((propMatch = propPattern.exec(objectContent)) !== null) {
      const [, propName, propType] = propMatch;
      const tsType = this.zodTypeToTypeScript(propType.trim());
      const isOptional = propType.includes('.optional()');
      const optional = isOptional ? '?' : '';

      properties.push(`  ${propName}${optional}: ${tsType};`);
    }

    return `{\n${properties.join('\n')}\n}`;
  }

  private handleNonObjectSchema(zodType: string, params: string): string {
    switch (zodType) {
      case 'enum':
        // Extract enum values and return as union type
        const enumValues = params.match(/\[([^\]]+)\]/)?.[1];
        if (enumValues) {
          return enumValues.replace(/'/g, '"');
        }
        return 'string';
      case 'array':
        return 'any[]';
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  }

  private zodTypeToTypeScript(zodType: string): string {
    // Handle complex zod types
    if (zodType.includes('string(')) return 'string';
    if (zodType.includes('number(')) return 'number';
    if (zodType.includes('boolean(')) return 'boolean';
    if (zodType.includes('date(')) return 'Date';
    if (zodType.includes('z.coerce.date(')) return 'Date';

    // Handle arrays
    if (zodType.includes('array(')) return 'any[]';
    if (zodType.includes('z.array(')) return 'any[]';

    // Handle enums
    if (zodType.includes('z.enum([')) {
      const enumMatch = zodType.match(/z\.enum\(\[([^\]]+)\]/);
      if (enumMatch) {
        return enumMatch[1].replace(/'/g, '"');
      }
    }

    // Handle transforms and refinements
    if (zodType.includes('.transform(')) {
      if (zodType.includes('Number')) return 'number';
      if (zodType.includes('String')) return 'string';
    }

    // Handle unions
    if (zodType.includes('.or(')) return 'string | number';

    return 'any';
  }

  private createBasicInterface(_typeName: string, fileContent: string): string {
    // Fallback: create a basic interface based on common patterns
    const commonFields = this.extractCommonFields(fileContent);
    if (commonFields.length > 0) {
      return `{\n${commonFields.join('\n')}\n}`;
    }
    return '{ [key: string]: any }';
  }

  private extractCommonFields(content: string): string[] {
    const fields: string[] = [];

    // Look for common field patterns in the file
    if (content.includes('id:')) fields.push('  id: number;');
    if (content.includes('email:')) fields.push('  email: string;');
    if (content.includes('name:')) fields.push('  name: string;');

    return fields;
  }

  private async generateOutputFile(types: ExtractedType[]): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const header = `/**
 * Auto-generated TypeScript types from Zod schemas
 * Generated on: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY - This file is generated automatically
 * Run 'npm run generate-types' to regenerate
 */

`;

    // Remove duplicates and group types by source file
    const uniqueTypes = types.filter((type, index, self) =>
      index === self.findIndex(t => t.name === type.name)
    );

    const typesBySource = uniqueTypes.reduce((acc, type) => {
      if (!acc[type.sourceFile]) acc[type.sourceFile] = [];
      acc[type.sourceFile].push(type);
      return acc;
    }, {} as Record<string, ExtractedType[]>);

    let content = header;

    // Generate types grouped by source
    for (const [source, sourceTypes] of Object.entries(typesBySource)) {
      content += `// ============================================================================\n`;
      content += `// Types from ${source}.ts\n`;
      content += `// ============================================================================\n\n`;

      for (const type of sourceTypes) {
        // Handle union/enum types differently
        if (type.content.includes('"') && !type.content.includes('{') && !type.content.includes('[key: string]')) {
          // Fix enum syntax for union types
          const cleanContent = type.content
            .replace(/^\s*\|\s*/, '') // Remove leading pipe
            .replace(/,\s*$/, '')    // Remove trailing comma
            .replace(/,\s*/g, ' | '); // Replace commas with pipes
          content += `export type ${type.name} = ${cleanContent};\n\n`;
        } else {
          content += `export interface ${type.name} ${type.content}\n\n`;
        }
      }
    }

    // Add utility types
    content += this.generateUtilityTypes();

    fs.writeFileSync(this.outputFile, content, 'utf-8');
  }

  private generateUtilityTypes(): string {
    return `// ============================================================================
// Utility Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export type ID = string | number;

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  url?: string;
}

// Common API input/output types
export interface BaseQueryParams {
  include?: string[];
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface DateRange {
  startDate?: Date | string;
  endDate?: Date | string;
}
`;
  }
}

// Run the generator
async function main() {
  try {
    const generator = new TypeGenerator();
    await generator.generateTypes();
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default TypeGenerator;