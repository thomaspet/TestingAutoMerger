import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import * as moment from 'moment';

declare const APP_VERSION: string;
declare const APP_BUILD_DATE: string;

@Component({
    selector: 'uni-versions-view',
    templateUrl: './versionsView.html'
})
export class UniVersionsView {
    private fullVersion = APP_VERSION;
    private minVersion = this.fullVersion.substr(0, 6);
    private buildDate = moment(APP_BUILD_DATE).format('DD.MM.YYYY HH:mm');
    private toolbarConfig: IToolbarConfig = {title: 'Versjoner'};

    constructor(private tabService: TabService) {
        this.tabService.addTab({
            name: 'Versjoner',
            url: '/about/versions',
            moduleID: UniModules.Versions,
            active: true
        });
    }
}
