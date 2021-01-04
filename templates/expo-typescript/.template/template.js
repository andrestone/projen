const {TypeScriptLibraryProject, Semver} = require('projen');

const project = new TypeScriptLibraryProject({
    name: 'expo-app',
    authorName: 'Joe Schmo',
    libdir: '.',
    srcdir: '.',
    authorEmail: 'joe@schno.me',
    repository: 'https://github.com/joe/schmo.git',
    tsconfig: {
        compilerOptions: {
            allowSyntheticDefaultImports: true,
            jsx: "react-native",
            lib: ["dom", "esnext"],
            moduleResolution: "node",
            noEmit: true,
            skipLibCheck: true,
            resolveJsonModule: true,
            strict: true
        }
    }
});
project.addScripts({
    start: 'expo start',
    android: 'expo start --android',
    ios: 'expo start --ios',
    web: 'expo start --web',
    eject: 'expo eject'
});
project.addDevDependencies({
    '@babel/core': Semver.caret("7.8.6"),
    '@types/react': Semver.tilde("16.9.41"),
    '@types/react-native': Semver.tilde("0.62.13"),
    typescript: Semver.tilde("3.9.5")
});
project.addDependencies({
    expo: Semver.tilde("38.0.0"),
    'expo-status-bar': Semver.caret("1.0.2"),
    react: Semver.tilde("16.11.0"),
    'react-dom': Semver.tilde("16.11.0"),
    'react-native': Semver.tilde("0.62.2"),
    'react-native-web': Semver.tilde("0.11.7")
});
project.gitignore.include('.expo/*');
project.gitignore.include('npm-debug.*');
project.gitignore.include('*.jks');
project.gitignore.include('*.p8');
project.gitignore.include('*.p12');
project.gitignore.include('*.key');
project.gitignore.include('*.mobileprovision');
project.gitignore.include('*.orig.*');
project.gitignore.include('web-build/');
project.gitignore.comment('macOS');
project.gitignore.include('.DS_Store');

module.exports = project;