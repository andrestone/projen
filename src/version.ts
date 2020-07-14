import { Construct, Lazy } from 'constructs';
import { JsonFile } from './json';
import { NodeProject } from './node-project';
import { Semver } from './semver';
import * as fs from 'fs-extra';
import * as path from 'path';

const VERSION_FILE = 'version.json';
const LERNA_VERSION_FILE = 'lerna.json';

export class Version extends Construct {
  private readonly versionFile: string;

  constructor(private readonly project: NodeProject, versionFile?: string) {
    super(project, 'bump-script');

    this.versionFile = versionFile || VERSION_FILE;

    new JsonFile(project, this.versionFile, {
      obj: {
        version: '0.0.0',
      },
      preserveJSONFields: ['version'],
      readonly: false,
    });

    project.addScripts({ bump: 'standard-version' });
    project.addScripts({ release: 'yarn bump && git push --follow-tags origin master' });
    project.addDevDependencies({
      'standard-version': Semver.caret('8.0.1'),
    });

    project.npmignore.comment('standard-version configuration');
    project.npmignore.exclude('/.versionrc.json');

    new JsonFile(project, '.versionrc.json', {
      obj: {
        packageFiles: [ {  filename: this.versionFile,  type: 'json' } ],
        bumpFiles: [ { filename: this.versionFile, type: 'json' }  ],
        commitAll: true,
        scripts: {
          postbump: 'yarn projen && git add .',
        },
      },
    });
  }

  /**
   * Returns the current version of the project.
   */
  public get current() {
    return Lazy.stringValue({
      produce: () => {
        if (!fs.existsSync(path.join(this.project.outdir, this.versionFile))) {
          return '0.0.0';
        }
        return JSON.parse(fs.readFileSync(path.join(this.project.outdir, this.versionFile), 'utf-8')).version;
      },
    })
  }
}

export class LernaVersion extends Construct {
  private readonly versionFile: string = LERNA_VERSION_FILE;
  constructor(project: NodeProject) {
    super(project, 'lerna-version');
    this.versionFile = path.join(project.outdir, this.versionFile)
  }

  public get current() {
    if (!fs.existsSync(this.versionFile)) {
      return '0.0.0';
    }

    return JSON.parse(fs.readFileSync(this.versionFile, 'utf-8')).version;
  }
}