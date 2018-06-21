// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyB3SL7QTKLQX638FZJfegOQoAffhmc7tgg',
    authDomain: 'cmmse-app.firebaseapp.com',
    databaseURL: 'https://cmmse-app.firebaseio.com',
    projectId: 'cmmse-app',
    storageBucket: 'cmmse-app.appspot.com',
    messagingSenderId: '607132431203'
  }
};
