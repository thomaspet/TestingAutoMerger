import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {LayoutModule} from '../layout/layoutModule';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AppCommonModule} from '../common/appCommonModule';
import {ReportsModule} from '../reports/reportsModule';

import {UniTickerOverview} from './overview/overview';
import {UniTicker} from './ticker/ticker';
import {UniTickerWrapper} from './tickerWrapper/tickerWrapper';
import {UniTickerContainer} from './tickerContainer/tickerContainer';
import {UniSubTickerContainer} from './subTickerContainer/subTickerContainer';
import {UniTickerDetailView} from './components/tickerDetailView';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,

        UniFrameworkModule,
        LayoutModule,

        AppCommonModule,
        ReportsModule,
    ],
    declarations: [
        UniTickerOverview,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerDetailView
    ],
    exports: [
        UniTickerOverview,
        UniTickerContainer,
        UniTicker,
        UniTickerWrapper,
        UniSubTickerContainer,
        UniTickerDetailView,
    ]
})
export class UniTickerModule {}
