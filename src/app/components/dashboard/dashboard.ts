import {Component, ViewChild} from '@angular/core';
import {UniWidgetCanvas, DefaultWidgetLayout} from '../widgets/widgetCanvas';
import * as Chart from 'chart.js';
import {LAYOUT_MAIN} from 'src/assets/dashboard-configs/main-dashboard';
import {AuthService} from '@app/authService';

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    @ViewChild(UniWidgetCanvas) widgetCanvas: UniWidgetCanvas;

    layout: DefaultWidgetLayout = LAYOUT_MAIN;
    companyName: string;

    constructor( private authService: AuthService ) {
        let companyName = this.authService.activeCompany && this.authService.activeCompany.Name;
        companyName = (companyName || '').substring(0, 40);
        if (companyName.length === 40) {
            companyName += '...';
        }
        this.companyName = companyName;

        // Avoid compile error. Seems to be something weird with the chart.js typings file
        (<any> Chart).defaults.global.maintainAspectRatio = false;
    }
}
