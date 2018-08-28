import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {
    ITickerActionOverride, ITickerColumnOverride
} from '@app/services/common/uniTickerService';
import {
    ErrorService
} from '@app/services/services';

@Component({
    selector: 'sharings-list',
    templateUrl: './sharingsList.html'
})
export class SharingsList implements OnInit {

    public actionOverrides: ITickerActionOverride[] = [];
    public columnOverrides: ITickerColumnOverride[] = [];

    constructor(
        private router: Router,
        private tabService: TabService,
        private errorService: ErrorService
    ) { }

    public ngOnInit() {
        this.tabService.addTab({
            url: '/sharings',
            name: 'Distribusjon',
            active: true,
            moduleID: UniModules.Sharings
        });
    }
}
