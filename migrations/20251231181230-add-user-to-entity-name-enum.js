module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'User' to the entity_name ENUM type
    // PostgreSQL requires using raw SQL to add a value to an existing ENUM
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- Check if 'User' value already exists in the enum
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = 'enum_notifications_entity_name'
          AND e.enumlabel = 'User'
        ) THEN
          -- Add 'User' to the enum
          ALTER TYPE "enum_notifications_entity_name" ADD VALUE 'User';
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL does not support removing values from ENUMs directly.
    // To rollback, you would need to:
    // 1. Create a new ENUM type without 'User'
    // 2. Alter the column to use the new type (with USING clause to convert values)
    // 3. Drop the old type
    // 4. Rename the new type to the old name
    //
    // This is complex and risky, so we don't implement automatic rollback.
    // If you need to rollback, ensure no data uses entityName='User' first,
    // then manually run the following SQL:

    console.log('WARNING: Rollback not implemented for ENUM value removal.');
    console.log('To manually rollback, ensure no notifications use entityName="User", then run:');
    console.log(`
      -- Create temporary enum without 'User'
      CREATE TYPE enum_notifications_entity_name_new AS ENUM ('Post', 'Blog', 'Discussion', 'Community', 'Comment', 'Message');

      -- Update the column to use new type
      ALTER TABLE notifications
        ALTER COLUMN entity_name TYPE enum_notifications_entity_name_new
        USING entity_name::text::enum_notifications_entity_name_new;

      -- Drop old type and rename new one
      DROP TYPE enum_notifications_entity_name;
      ALTER TYPE enum_notifications_entity_name_new RENAME TO enum_notifications_entity_name;
    `);
  },
};
