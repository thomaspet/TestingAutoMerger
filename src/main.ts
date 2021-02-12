import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/appModule';
import {environment, setEnvironment} from './environments/environment';
import {setTheme} from './themes/theme';

declare global {
  interface Window {
    dnbDataLayer: any[];
    zESettings: any;
  }
}



async function loadConfigs() {
    const versionGuid = window['VERSION_GUID'];
    const env = await fetch(`/config/dist/env.json?v=${versionGuid}`).then(res => res.json());
    setEnvironment(env);

    // @ts-ignore
    const theme = await import(/* webpackIgnore: true */ `/config/dist/theme/theme.js?v=${versionGuid}`).then(file => file.default);
    setTheme(theme);

    if (environment.useProdMode) {
        enableProdMode();
    }
}

loadConfigs().then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
});


