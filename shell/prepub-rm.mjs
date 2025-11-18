import { rm } from "fs/promises";
import { existsSync } from "fs";
import { exec } from "child_process";

if (existsSync('_dist')) {
    await rm('_dist', { recursive: true });
}
exec('pnpm tsc');