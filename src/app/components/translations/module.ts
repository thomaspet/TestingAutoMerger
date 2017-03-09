import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {LayoutModule} from '../layout/layoutModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {AppServicesModule} from '../../services/servicesModule';
import {routes as TranslationRoutes} from './routes';

import {TranslationService, LanguageService, TranslatableService} from './services';
import {LanguagesContainer} from './pages/languages/languagesContainer';
import {AddLanguageComponent} from './pages/languages/components/addLanguage';
import {DeleteLanguageComponent} from './pages/languages/components/deleteLanguage';
import {LanguagesListComponent} from './pages/languages/components/languagesList';

import {TranslationsContainer} from './pages/translations/translationsContainer';
import {TranslatablesListComponent} from './pages/translations/components/translatablesList';
import {TranslationDetailComponent} from './pages/translations/components/translationDetail';
import {UniTranslatablesFilter} from './pages/translations/components/filter';

import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {LanguageEffects} from './language/effects';
import {TranslatableEffects} from './translatable/effects';
import {TranslationEffects} from './translation/effects';
import reducer from './reducers';

@NgModule({
    imports: [
        // Angular modules
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        // ngrx
        StoreModule.provideStore(reducer),
        EffectsModule.runAfterBootstrap(LanguageEffects),
        EffectsModule.runAfterBootstrap(TranslatableEffects),
        EffectsModule.runAfterBootstrap(TranslationEffects),

        // UniTable
        UniTableModule,

        // UniForm
        UniFormModule,

        // Framework
        UniFrameworkModule,

        // App Modules
        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        AppServicesModule,

        // Route module
        TranslationRoutes
    ],
    declarations: [
        LanguagesContainer,
        LanguagesListComponent,
        AddLanguageComponent,
        DeleteLanguageComponent,

        TranslationsContainer,
        TranslatablesListComponent,
        TranslationDetailComponent,
        UniTranslatablesFilter
    ],
    providers: [
        TranslationService,
        TranslatableService,
        LanguageService
    ]
})
export class TranslationsModule {
    
}
