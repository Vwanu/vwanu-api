import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique } from 'sequelize-typescript';

export interface TemplateMessageInterface {
  snug: string;
  templateBody: string;
  requiredFields: object;
}

@Table({
  modelName: 'Template',
})
export class Template extends Model<TemplateMessageInterface> implements TemplateMessageInterface {
  
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  snug!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'template_body',
  })
  templateBody!: string;

  @AllowNull(false)
  @Column({
    type: DataType.JSON,
    allowNull: false,
    field: 'required_fields',
  })
  requiredFields!: object;

  // Instance methods for better encapsulation
  public getDisplayName(): string {
    return this.snug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  public getTemplateData(): TemplateMessageInterface {
    return {
      snug: this.snug,
      templateBody: this.templateBody,
      requiredFields: this.requiredFields,
    };
  }

  public hasRequiredFields(): boolean {
    return this.requiredFields && Object.keys(this.requiredFields).length > 0;
  }

  public getRequiredFieldNames(): string[] {
    if (!this.hasRequiredFields()) return [];
    return Object.keys(this.requiredFields);
  }

  public validateRequiredFields(data: Record<string, unknown>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFieldNames = this.getRequiredFieldNames();
    const missingFields = requiredFieldNames.filter(field => 
      !(field in data) || data[field] === null || data[field] === undefined
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  public renderTemplate(data: Record<string, unknown>): string {
    let rendered = this.templateBody;
    
    // Simple template variable replacement: {{variableName}}
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }
    
    return rendered;
  }

  public getTemplateVariables(): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(this.templateBody)) !== null) {
      if (!variables.includes(match[1].trim())) {
        variables.push(match[1].trim());
      }
    }
    
    return variables;
  }

  public isValidTemplate(): boolean {
    // Check if template has valid syntax (no unclosed braces, etc.)
    const openBraces = (this.templateBody.match(/\{\{/g) || []).length;
    const closeBraces = (this.templateBody.match(/\}\}/g) || []).length;
    return openBraces === closeBraces;
  }

  public getTemplateLength(): number {
    return this.templateBody.length;
  }

  public getSlug(): string {
    return this.snug;
  }
}
