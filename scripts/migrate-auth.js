#!/usr/bin/env node

/**
 * Migration script to update all service hook files from using
 * Feathers JWT authentication to Cognito authentication.
 *
 * Usage: node scripts/migrate-auth.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const servicesDir = path.join(__dirname, '../src/services');

// Find all hook files in the services directory
const hookFiles = glob.sync('**/*.hook?(s).ts', { cwd: servicesDir });

let updatedCount = 0;

hookFiles.forEach((hookFile) => {
  const filePath = path.join(servicesDir, hookFile);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that already use requireAuth
  if (
    content.includes('requireAuth') &&
    !content.includes("authenticate('jwt')")
  ) {
    console.log(`Skipping ${hookFile} as it already uses requireAuth`);
    return;
  }

  // Replace import statement
  let hasChanges = false;

  if (
    content.includes(
      "import * as feathersAuthentication from '@feathersjs/authentication';"
    )
  ) {
    content = content.replace(
      "import * as feathersAuthentication from '@feathersjs/authentication';",
      ""
    );
    hasChanges = true;
  }

  // Remove the const { authenticate } = feathersAuthentication.hooks; line
  if (
    content.includes('const { authenticate } = feathersAuthentication.hooks;')
  ) {
    content = content.replace(
      'const { authenticate } = feathersAuthentication.hooks;',
      ''
    );
    hasChanges = true;
  }

  // Replace authenticate('jwt') with requireAuth in all: []
  if (content.includes("authenticate('jwt')")) {
    content = content.replace(/authenticate\('jwt'\)/g, 'requireAuth');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    updatedCount += 1;
    console.log(`Updated ${hookFile}`);
  } else {
    console.log(`No changes needed for ${hookFile}`);
  }
});

console.log(`\nMigration complete. Updated ${updatedCount} hook files.`);
