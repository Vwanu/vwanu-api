import { execSync, spawnSync } from 'child_process';


export default async function (): Promise<void> {
    const docker_stop = spawnSync('docker', ['stop', 'test-postgres']);
    console.log(docker_stop.stdout.toString());
    const docker_remove = spawnSync('docker', ['rm', 'test-postgres']);
    console.log(docker_remove.stdout.toString());
    await new Promise((resolve) => setTimeout(resolve, 5000));
}