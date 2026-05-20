'use strict';

/**
 * VWA-140 step 1/3: drop the dead per-user preference tables.
 *
 * Context discovered during recon:
 *   - `user_notification_types` is in the migrations but its model is
 *     commented out of database/index.ts and no live code populates it.
 *     Effectively dead.
 *   - `user_notifications_settings` (typo: plural notifications, singular
 *     settings) has a model file but no CREATE migration — almost certainly
 *     doesn't exist in prod. IF EXISTS handles the dev/sandbox case.
 *   - `notification_settings` is a third lookup table created by the seed
 *     migration 20240131220618 but never referenced in code. Also IF EXISTS.
 *
 * Dropping these first clears the way for migration 2 to drop the legacy
 * `notification_types` table (whose old shape is keyed on `notification_slug`
 * as TEXT PK) so it can be replaced with the new (SERIAL id PK) shape.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS user_notification_types CASCADE;'
    );
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS user_notifications_settings CASCADE;'
    );
    await queryInterface.sequelize.query(
      'DROP TABLE IF EXISTS notification_settings CASCADE;'
    );
  },

  async down() {
    // Intentional no-op: these tables held no production data and dropping
    // them is the desired permanent state. Recovery is via git history if
    // ever needed.
  },
};
