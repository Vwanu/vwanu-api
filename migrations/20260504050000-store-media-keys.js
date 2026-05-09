'use strict';

/**
 * VWA-133 — switch picture columns from full S3 URLs to S3 keys.
 *
 * For rows where the column holds a `*.amazonaws.com/<key>` URL, extract
 * just the key. Rows holding external URLs (UI-Avatars, Cloudinary,
 * Unsplash) are left untouched — mobile's cdnImageUrl helper passes those
 * through.
 *
 * Also drops `medias.large/medium/small/tiny` — these were Cloudinary-era
 * derived URLs. Variants are now generated on-demand at the CloudFront
 * edge by the AWS image-handler stack (VWA-131).
 *
 * Skips `users.cover_picture` — that column is being dropped entirely
 * under VWA-137.
 */

const EXTRACT = `regexp_replace($COL$, '^https?://[^/]*\\.amazonaws\\.com/(.*)$', '\\1')`;
const PREDICATE = `$COL$ LIKE '%amazonaws.com/%'`;

const buildBackfill = (table, column) => `
  UPDATE ${table}
  SET ${column} = ${EXTRACT.replaceAll('$COL$', column)}
  WHERE ${PREDICATE.replaceAll('$COL$', column)}
`;

module.exports = {
  async up(queryInterface) {
    // Backfill: extract key from S3 URLs across every picture column.
    const backfills = [
      ['medias', 'original'],
      ['users', 'profile_picture'],
      ['communities', 'profile_picture'],
      ['communities', 'cover_picture'],
      ['blogs', 'title_picture'],
    ];
    for (const [table, column] of backfills) {
      await queryInterface.sequelize.query(buildBackfill(table, column));
    }

    // Drop the obsolete derived-variant columns on medias.
    for (const col of ['large', 'medium', 'small', 'tiny']) {
      await queryInterface.removeColumn('medias', col);
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add the dropped columns (nullable). Variant data is lost; the
    // BeforeSave hook in older code would have re-derived them on the
    // next save.
    for (const col of ['large', 'medium', 'small', 'tiny']) {
      await queryInterface.addColumn('medias', col, {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Best-effort: re-prepend the bucket prefix to any value that looks
    // like a key. Reads bucket name from env at down-migration time.
    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) {
      // Without a bucket, leave keys as-is — rows still read; cdnImageUrl
      // on the mobile side handles either form.
      return;
    }
    const region = process.env.AWS_REGION || 'us-east-1';
    const prefix = `https://${bucket}.s3.${region}.amazonaws.com/`;
    const restore = (table, column) => `
      UPDATE ${table}
      SET ${column} = '${prefix}' || ${column}
      WHERE ${column} IS NOT NULL
        AND ${column} NOT LIKE 'http%'
    `;
    const restorations = [
      ['medias', 'original'],
      ['users', 'profile_picture'],
      ['communities', 'profile_picture'],
      ['communities', 'cover_picture'],
      ['blogs', 'title_picture'],
    ];
    for (const [table, column] of restorations) {
      await queryInterface.sequelize.query(restore(table, column));
    }
  },
};
