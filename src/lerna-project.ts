import { NodeProject, NodeProjectOptions } from './node-project';
import { JsonFile } from './json';
import { Semver } from './semver';
import * as fs from 'fs-extra';
import * as path from 'path';
import { availableTemplates } from './cli';
import { ISynthesisSession } from 'constructs';

export interface LernaPackage {
  readonly project: NodeProject | Promise<NodeProject>;
  readonly location: string;
}

export interface PackageFromTemplateOptions {
  /**
   * Template name or promise (NodeProject.fromTemplate)
   */
  readonly template: string | Promise<NodeProject>;

  /**
   * Location
   *
   * @default 'packages'
   */
  readonly location?: string;

  /**
   * Name of the package (folder name)
   *
   * @default 'package.json.name'
   */
  readonly name?: string;

  /**
   * A function that takes the project as an object to allow changes to the template.
   *
   * const customFields = (proj: NodeProject) {
   *   proj.addFields{
   *     foo: 'bar',
   *     baz: 'zinga',
   *   }
   * }
   *
   * @default -
   */
  readonly modifier?: any; // is there a way to use () => type with jsii?
}

export class LernaProject extends NodeProject {
  public readonly packages: LernaPackage[];
  private readonly lernaJson: any;
  private readonly workspaces: Array<string>;
  private readonly noHoistPatterns: Array<string>;

  constructor(options: LernaProjectOptions) {
    super({lernaVersioning: true, ...options, private: true});
    this.packages = new Array<LernaPackage>();
    this.workspaces = new Array<string>();
    this.noHoistPatterns = new Array<string>();


    this.addDevDependencies({lerna: Semver.caret('3.22.1')});

    this.lernaJson = {
      npmClient: 'yarn',
      useWorkspaces: true,
      version: '0.0.0',
    };

    // New JsonFile for lerna.json
    new JsonFile(this, 'lerna.json', {
      obj: this.lernaJson,
    });

    for (const pack of options.packages || []) {
      this.addPackage(pack.project, pack.location)
    }

    this.addFields({
      workspaces:
        {
          packages: this.workspaces,
          nohoist: this.noHoistPatterns,
        },
    });
  }

  public addWorkspace(pattern: string) {
    if (!this.workspaces.includes(pattern)) this.workspaces.push(pattern);
  }

  /**
   * Adds a Package to the monorepo using a Projen Template.
   * If a string is passed, a project is built using the referred template.
   * Can also add a package from a Promise object created via `NodeProject.fromTemplate`
   *
   */
  public addPackageFromTemplate(options: PackageFromTemplateOptions): Promise<NodeProject> {
    let project;
    if (typeof options.template == 'string' && (availableTemplates || []).includes(options.template)) {
      project = NodeProject.fromTemplate({
        templateName: options.template,
        outDir: path.join(this.outdir, options.location || 'packages'),
        copyFiles: true,
        name: options.name,
        modifier: options.modifier,
      });
    } else if (options.template instanceof Promise) {
      project = options.template;
    }
    if (!project) {
      throw new Error(`Template doesn't exist: ${options.template}`);
    }
    this.addPackage(project, options.location || 'packages')
    return project;
  }

  public addPackage(project: NodeProject | Promise<NodeProject>, location?: string) {

    const packageLocation = `${location || 'packages'}`;
    this.addWorkspace(`${packageLocation}/*`);
    this.packages.push({project, location: location || 'packages'});
  }

  public noHoist(project: NodeProject | string, dependency: NodeProject | string) {
    const packageName = project instanceof NodeProject ? project.manifest.name : project;
    const depName = dependency instanceof NodeProject ? dependency.manifest.name : dependency;
    const entry = `${packageName}/${depName}`;
    if (!this.noHoistPatterns.includes(entry)) this.noHoistPatterns.push(entry);
  }

  public onSynthesize(session: ISynthesisSession) {
    super.onSynthesize(session);
    const synth = (project: NodeProject, location: string) => {
      const outputDir = `${location}/${project.name}`;
      if (!fs.existsSync(path.join(this.outdir, outputDir))) {
        fs.mkdirpSync(path.join(this.outdir, outputDir));
      }
      try {
        project.synth(path.join(this.outdir, outputDir));
      } catch (e) {
        process.stderr.write(`Error when synthesizing lerna package: ${e}\n`);
        throw e;
      }
    }
    for (const pack of this.packages) {
      if (pack.project instanceof Promise) {
        pack.project.then(proj => synth(proj, pack.location));
      } else {
        synth(pack.project, pack.location)
      }
    }
  }
}

export interface LernaProjectOptions extends NodeProjectOptions {

  /**
   * Packages to create
   */
  readonly packages?: LernaPackage[];

}