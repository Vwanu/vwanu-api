
import { spawnSync } from 'child_process';
import request from 'supertest';

import app from '../src/app';
import dockerDatabase from './docker/docker-setup';

export default async function (globalConfig, projectConfig) {

  // const docker = spawnSync('docker', ['ps', '|', 'grep', 'test-postgres']);
  // console.log('docker', docker.stdout.toString());
  // await dockerDatabase();

  // console.log('dockerdatabase configured');
  console.log('Setting up migrations...')
  const ls = spawnSync('./docker-entrypoint.testing.sh');

  console.log('ls', ls.stdout.toString());
  console.error('ls', ls.stderr.toString());

  const sequelize = app.get('sequelizeClient');
  globalThis.__SEQUELIZE__ = sequelize;
  globalThis.__APP__ = app;
  globalThis.__SERVER__ = request(app);


}
