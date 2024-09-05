import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as chalk from 'chalk';
import { join } from 'path';
import { configStageKV } from './config.constants';

const envMode = process.env.STAGE || 'prod';

export * from './config.interface';
export * from './typeorm.config.service';
export * from './config.constants';
export * from './config.schema';

export const isDevMode = () => configStageKV[envMode] === 'dev';

export default () => {
  const log = console.log;

  const envfilePath = join(
    process.cwd(),
    `./.conf/${configStageKV[envMode]}.yml`,
  );

  log(
    chalk.blueBright(
      `[${envMode}] Start loading configuration file: ${envfilePath}`,
    ),
  );

  return yaml.load(readFileSync(envfilePath, 'utf-8')) as Record<string, any>;
};
