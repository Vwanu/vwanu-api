import dockerTeardown from './docker/docker-teardown';
export default async function (globalConfig, projectConfig) {
  console.log('Teardown');
  console.log('Closing database connection');
  // await dockerTeardown();
  //await globalThis.__SEQUELIZE__.sync({ });
  await globalThis.__SEQUELIZE__.close();
};
