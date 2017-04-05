// Angular imports
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

// App imports
import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AppCommonModule} from '../common/appCommonModule';
import {AppPipesModule} from '../../pipes/appPipesModule';
import {ReportsModule} from '../reports/reportsModule';


// routes
import {routes as UniTickerRoutes} from './uniTickerRoutes';
import {UniTickers} from './uniTickers';
import {UniTickerOverview} from './overview/overview';
import {UniTickerList} from './list/tickerList';
import {UniTicker} from './ticker/ticker';
import {UniTickerWrapper} from './tickerWrapper/tickerWrapper';
import {UniTickerContainer} from './tickerContainer/tickerContainer';
import {UniSubTickerContainer} from './subTickerContainer/subTickerContainer';
import {UniTickerActions} from './components/tickerActions';
import {UniTickerFilters} from './components/tickerFilters';
import {UniTickerFiltersNavBar} from './components/tickerFiltersNavBar';
import {UniTickerFilterEditor} from './components/tickerFilterEditor';
import {UniTickerFieldFilterEditor} from './components/tickerFieldFilterEditor';
import {UniTickerDetailView} from './components/tickerDetailView';
import {UniTickerSearchHistory} from './components/searchHistory';

@NgModule({
    imports: [
        // Angular modules
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,

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
        ReportsModule,

        // Route module
        UniTickerRoutes
    ],
    declarations: [
        UniTickers,
        UniTickerOverview,
        UniTickerList,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerActions,
        UniTickerFiltersNavBar,
        UniTickerFilters,
        UniTickerFilterEditor,
        UniTickerDetailView,
        UniTickerSearchHistory,
        UniTickerFieldFilterEditor
    ],
    entryComponents: [

    ],
    exports: [
        UniTickers,
        UniTickerOverview,
        UniTickerList,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerActions,
        UniTickerFiltersNavBar,
        UniTickerFilters,
        UniTickerFilterEditor,
        UniTickerDetailView,
        UniTickerSearchHistory,
        UniTickerFieldFilterEditor
    ]
})
export class UniTickerModule {}
