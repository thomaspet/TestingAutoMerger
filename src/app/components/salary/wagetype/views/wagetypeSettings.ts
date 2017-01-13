import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageType } from '../../../../unientities';
import { WageTypeService, UniCacheService, ErrorService } from '../../../../services/services';
import { UniView } from '../../../../../framework/core/uniView';

@Component({
    selector: 'uni-wagetype-settings',
    templateUrl: 'app/components/salary/wagetype/views/wagetypeSettings.html'
})
export class WageTypeSettings extends UniView {
    private wageType: WageType;
    private fields: any[];
    private config: any;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private wagetypeService: WageTypeService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService
    ) {
        super(router.url, cacheService);
        this.config = {};
        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('wagetype').subscribe((wagetype: WageType) => {
                this.wageType = wagetype;
            });
        });

        wagetypeService.specialSettingsLayout('').subscribe(layout => {
            this.fields = layout.Fields;
        });

    }

    private change(event) {
        super.updateState('wagetype', this.wageType, true);
    }
}
