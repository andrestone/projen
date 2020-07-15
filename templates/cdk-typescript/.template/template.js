const {TypeScriptLibraryProject, Semver} = require('projen');

const cdkVersion = '1.51.0';

const project = new TypeScriptLibraryProject({
    name: 'cdk-app',
    authorName: 'Joe Schmo',
    authorEmail: 'joe@schno.me',
    repository: 'https://github.com/joe/schmo.git',
});
project.addScripts({
    build: 'tsc',
    watch: 'tsc -w',
    test: 'jest',
    cdk: 'cdk',
});
project.addDevDependencies({
    '@aws-cdk/assert': Semver.caret(cdkVersion),
    '@types/jest': Semver.caret('25.2.1'),
    '@types/node': Semver.pinned('10.17.5'),
    jest: Semver.caret('25.5.0'),
    'ts-jest': Semver.caret('25.3.1'),
    'aws-cdk': Semver.caret(cdkVersion),
    'ts-node': Semver.caret('8.1.0'),
    typescript: Semver.tilde('3.7.2'),
});
project.addDependencies({
    '@aws-cdk/core': Semver.caret(cdkVersion),
});
module.exports = project;