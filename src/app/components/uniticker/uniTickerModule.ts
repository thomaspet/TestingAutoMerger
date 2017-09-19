// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {ReportsModule} from '../reports/reportsModule';


// routes
import {routes as UniTickerRoutes} from './uniTickerRoutes';
import {UniTickerOverview} from './overview/overview';
import {UniTicker} from './ticker/ticker';
import {UniTickerWrapper} from './tickerWrapper/tickerWrapper';
import {UniTickerContainer} from './tickerContainer/tickerContainer';
import {UniSubTickerContainer} from './subTickerContainer/subTickerContainer';
import {UniTickerFilters} from './components/tickerFilters';
import {UniTickerPredefinedFilters} from './filters/predefinedFilters';
import {UniTickerFilterEditor} from './components/tickerFilterEditor';
import {UniTickerFieldFilterEditor} from './components/tickerFieldFilterEditor';
import {UniTickerDetailView} from './components/tickerDetailView';
import {UniTickerSearchHistory} from './components/searchHistory';
import {UniTickerFieldFilterEditorSimple} from './components/tickerFieldFilterEditorSimple';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

        UniFrameworkModule,

        LayoutModule,
        AppCommonModule,
        AppPipesModule,
        ReportsModule,

        UniTickerRoutes
    ],
    declarations: [
        UniTickerOverview,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerPredefinedFilters,
        UniTickerFilters,
        UniTickerFilterEditor,
        UniTickerDetailView,
        UniTickerSearchHistory,
        UniTickerFieldFilterEditor,
        UniTickerFieldFilterEditorSimple
    ],
    entryComponents: [

    ],
    exports: [
        UniTickerOverview,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerPredefinedFilters,
        UniTickerFilters,
        UniTickerFilterEditor,
        UniTickerDetailView,
        UniTickerSearchHistory,
        UniTickerFieldFilterEditor,
        UniTickerFieldFilterEditorSimple
    ]
})
export class UniTickerModule {}
