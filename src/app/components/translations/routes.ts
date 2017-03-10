import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../authGuard';
import {LanguagesContainer} from './pages/languages/languagesContainer';
import {TranslationsContainer} from './pages/translations/translationsContainer';

const translationsRoutes: Routes = [
    {
        path: 'admin/languages',
        component: LanguagesContainer,
        canActivate: [AuthGuard],

    },
    {
        path: 'admin/languages/:id/translations',
        component: TranslationsContainer,
        canActivate: [AuthGuard],

    }

];
export const routes: ModuleWithProviders = RouterModule.forChild(translationsRoutes);
