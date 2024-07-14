const fs = require('fs');
const path = require('path');

// Directory where Sequelize migrations are stored
const migrationsDir = path.join(__dirname, 'migrations');
const outputSqlFile = path.join(__dirname, 'main.sql');

function convertSequelizeToPostgres(migrationContent) {
  // This function will need to parse the Sequelize migration content
  // and convert it to PostgreSQL SQL statements.
  // This example assumes a simple case of extracting `createTable` definitions.
  const createTableRegex =
    /await queryInterface.createTable\(([^,]+),\s*{([^}]+)}/gs;

  let match;
  let sqlStatements = '';

  while ((match = createTableRegex.exec(migrationContent)) !== null) {
    const tableName = match[1].trim().replace(/['"]/g, '');
    const columns = match[2].trim();

    // Start building the SQL statement
    let sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;

    // Convert each column definition
    const columnRegex = /(\w+):\s*{\s*type:\s*Sequelize\.(\w+)([^}]*)}/g;
    let columnMatch;
    while ((columnMatch = columnRegex.exec(columns)) !== null) {
      const columnName = columnMatch[1];
      const columnType = columnMatch[2];
      const columnOptions = columnMatch[3];

      let postgresType;
      switch (columnType) {
        case 'UUID':
          postgresType = 'UUID';
          break;
        case 'STRING':
          postgresType = 'VARCHAR(255)';
          break;
        case 'INTEGER':
          postgresType = 'INTEGER';
          break;
        case 'DATE':
          postgresType = 'TIMESTAMP';
          break;
        default:
          postgresType = columnType; // For simplicity, handle other types as is
      }

      let options = '';
      if (columnOptions.includes('primaryKey: true')) {
        options += ' PRIMARY KEY';
      }
      if (columnOptions.includes('allowNull: false')) {
        options += ' NOT NULL';
      }
      if (columnOptions.includes('unique: true')) {
        options += ' UNIQUE';
      }
      if (columnOptions.includes('defaultValue: Sequelize.UUIDV4')) {
        options += ' DEFAULT uuid_generate_v4()';
      }
      if (columnOptions.includes('defaultValue: 0')) {
        options += ' DEFAULT 0';
      }

      sql += `  "${columnName}" ${postgresType}${options},\n`;
    }

    // Remove trailing comma and add closing parenthesis
    sql = sql.slice(0, -2) + '\n);\n';
    sqlStatements += sql;
  }

  return sqlStatements;
}

function readMigrationsAndConvert() {
  fs.readdir(migrationsDir, (err, files) => {
    if (err) {
      console.error('Error reading migrations directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(migrationsDir, file);
      fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
          console.error(`Error reading migration file ${file}:`, err);
          return;
        }

        const sqlStatements = convertSequelizeToPostgres(content);
        fs.appendFile(outputSqlFile, sqlStatements, (err) => {
          if (err) {
            console.error(`Error appending to ${outputSqlFile}:`, err);
          } else {
            console.log(`Successfully appended ${file} to ${outputSqlFile}`);
          }
        });
      });
    });
  });
}

// Execute the function to read migrations and convert them
readMigrationsAndConvert();
