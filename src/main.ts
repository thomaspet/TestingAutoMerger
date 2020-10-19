import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/appModule';
import { environment } from './environments/environment';

declare global {
    interface Window {
        dnbDataLayer: any[];
    }
}

if (environment.useProdMode) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
