import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageType } from '../../../../unientities';
import { WageTypeService, UniCacheService, ErrorService } from '../../../../services/services';
import { UniView } from '../../../../../framework/core/uniView';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
@Component({
    selector: 'uni-wagetype-settings',
    templateUrl: './wagetypeSettings.html'
})
export class WageTypeSettings extends UniView {
    private wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private wagetypeService: WageTypeService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService
    ) {
        super(router.url, cacheService);
        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('wagetype').subscribe((wagetype: WageType) => {
                this.wageType$.next(wagetype);
            });
        });

        wagetypeService.specialSettingsLayout('').subscribe(layout => {
            this.fields$.next(layout.Fields);
        });

    }

    private change(event) {
        super.updateState('wagetype', this.wageType$.getValue(), true);
    }
}
