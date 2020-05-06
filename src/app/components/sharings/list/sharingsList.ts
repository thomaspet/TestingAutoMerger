import {Component, OnInit} from '@angular/core';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
import {PageStateService} from '@app/services/services';

@Component({
    selector: 'sharings-list',
    templateUrl: './sharingsList.html'
})
export class SharingsList implements OnInit {

    constructor(
        private tabService: TabService,
        private pageStateService: PageStateService
    ) { }

    public ngOnInit() {
        this.tabService.addTab({
            url: this.pageStateService.getUrl(),
            name: 'Utsendingsliste',
            active: true,
            moduleID: UniModules.Sharings
        });
    }
}
