import {Component, ViewChild} from '@angular/core';
import {UniWidgetCanvas, DefaultWidgetLayout} from '../widgets/widgetCanvas';
import * as Chart from 'chart.js';
import {theme} from 'src/themes/theme';
import {AuthService} from '@app/authService';

@Component({
    selector: 'uni-dashboard',
    templateUrl: './dashboard.html'
})
export class Dashboard {
    @ViewChild(UniWidgetCanvas, { static: true }) widgetCanvas: UniWidgetCanvas;

    layout: DefaultWidgetLayout = theme.dashboardConfig;
    companyName: string;

    constructor(private authService: AuthService) {
        let companyName = this.authService.activeCompany && this.authService.activeCompany.Name;
        companyName = (companyName || '').substring(0, 40);
        if (companyName.length === 40) {
            companyName += '...';
        }
        this.companyName = companyName;

        Chart.defaults.global.maintainAspectRatio = false;
    }
}
