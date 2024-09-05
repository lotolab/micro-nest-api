import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

export class FsHelper {
  static getRootDir() {
    return path.resolve(process.cwd());
  }

  static join(...paths) {
    return path.join(...paths);
  }

  static checkEnsureDir(pathdir: string) {
    let finaldir = pathdir;
    if (pathdir.startsWith('./')) {
      finaldir = path.resolve(process.cwd(), pathdir);
    } else if (pathdir.startsWith('/')) {
      finaldir = path.resolve(pathdir);
    } else {
      finaldir = path.resolve(process.cwd(), pathdir);
    }

    if (!fs.existsSync(finaldir)) {
      fs.mkdirSync(finaldir, { recursive: true });
    }

    return finaldir;
  }

  static readJsonFileSync<T = any>(file: string): T {
    if (!fs.existsSync(file)) return undefined;
    try {
      const data = fs.readFileSync(file, { encoding: 'utf-8' });
      const json = JSON.parse(data);
      return json as unknown as T;
    } catch (e) {
      throw e;
    }
  }

  static writeFile(filename: string, savepath: string, buffer: Buffer): string {
    const tmp = FsHelper.checkEnsureDir(savepath);
    const file = path.resolve(tmp, filename);
    fs.writeFileSync(file, buffer);
    return file;
  }

  static writeJsonFile(filename: string, savepath: string, json: any) {
    const tmp = FsHelper.checkEnsureDir(savepath);
    const file = path.resolve(tmp, filename);

    fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf-8');
  }

  static appendFile(filename: string, savepath: string, text: string) {
    const tmp = FsHelper.checkEnsureDir(savepath);
    const file = path.resolve(tmp, filename);
    fs.appendFileSync(file, text, 'utf8');
    return file;
  }

  static appendByFilepath(file: string, text: string) {
    fs.appendFileSync(file, text, 'utf8');
    return file;
  }

  static ensureFileSync(filename: string, savepath: string, data?: string) {
    const tmp = FsHelper.checkEnsureDir(savepath);
    const file = path.resolve(tmp, filename);

    if (data) {
      fs.writeFileSync(file, data, 'utf-8');
    }
    return file;
  }
}
