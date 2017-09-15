import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LanguagesContainer} from './pages/languages/languagesContainer';
import {TranslationsContainer} from './pages/translations/translationsContainer';

const translationsRoutes: Routes = [
    {
        path: 'admin/languages',
        component: LanguagesContainer,

    },
    {
        path: 'admin/languages/:id/translations',
        component: TranslationsContainer,
    }
];
export const routes: ModuleWithProviders = RouterModule.forChild(translationsRoutes);
