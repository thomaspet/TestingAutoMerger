import {Component} from '@angular/core';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';

declare const APP_VERSION: string;
declare const APP_BUILD_DATE: string;

@Component({
    selector: 'uni-versions-view',
    templateUrl: './versionsView.html'
})
export class UniVersionsView {
    private fullVersion = APP_VERSION;
    private minVersion = this.fullVersion.substr(0, 6);
    private buildDate = APP_BUILD_DATE;
    private toolbarConfig: IToolbarConfig = {title: 'Versioner'};

    constructor(private tabService: TabService) {
        this.tabService.addTab({
            name: 'Versioner',
            url: '/about/versions',
            moduleID: UniModules.Versions,
            active: true
        });
    }
}
