import { execSync } from 'child_process';

export default async function (): Promise<void> {


    // const ls = spawnSync('./docker-entrypoint.testing.sh');

    // console.log('ls', ls.stdout.toString());
    // console.error('ls', ls.stderr.toString());
    // execSync('docker build -t test-postgres -f ./Dockerfile .');
    // execSync('docker run -d --name test-postgres -p 5432:5432 test-postgres');
    execSync('docker run --name test-postgres -d -p 5432:5432 -e POSTGRES_PASSWORD=123456 -e POSTGRES_USER=vwanu -e POSTGRES_DB=social_media postgres:12');
    console.log('Started test-postgres database');

    //wait for the database to start
    await new Promise((resolve) => setTimeout(resolve, 5000));
}