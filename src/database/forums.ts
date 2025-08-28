import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Unique, Default, TableOptions } from 'sequelize-typescript';

export interface ForumInterface {
  id: string;
  name: string;
  description?: string;
  coverPicture?: string;
  searchVector?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Table({
  modelName: 'Forum',
  tableName: 'forums',
  underscored: true,
} as TableOptions<Forum>)
export class Forum extends Model<ForumInterface> implements ForumInterface {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id!: string;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500], // Forum name between 1-500 characters
    },
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: true, // Validate that it's a valid URL if provided
    },
  })
  coverPicture?: string;

  @Column({
    type: DataType.TEXT, // Using TEXT instead of TSVECTOR for better compatibility
    allowNull: true,
    field: 'search_vector',
  })
  searchVector?: string;

  // Instance methods for better encapsulation
  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description || '';
  }

  public hasCoverPicture(): boolean {
    return !!this.coverPicture && this.coverPicture.length > 0;
  }

  public getCoverPicture(): string | undefined {
    return this.coverPicture;
  }

  public setCoverPicture(url: string): void {
    this.coverPicture = url;
  }

  public removeCoverPicture(): void {
    this.coverPicture = undefined;
  }

  public getDisplayName(): string {
    return this.name.trim();
  }

  public hasDescription(): boolean {
    return !!this.description && this.description.length > 0;
  }

  public getSearchVector(): string {
    return this.searchVector || '';
  }

  public updateSearchVector(): void {
    // Generate search vector from name and description
    const searchText = [this.name, this.description || ''].join(' ').toLowerCase();
    this.searchVector = searchText;
  }

  public getForumData(): ForumInterface {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      coverPicture: this.coverPicture,
      searchVector: this.searchVector,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Forum;
