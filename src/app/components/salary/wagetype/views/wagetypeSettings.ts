import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageType,LimitType } from '../../../../unientities';
import { WageTypeService, UniCacheService, ErrorService } from '../../../../services/services';
import { UniView } from '../../../../../framework/core/uniView';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'uni-wagetype-settings',
    templateUrl: './wagetypeSettings.html'
})
export class WageTypeSettings extends UniView {
    private wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    private fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private config$: BehaviorSubject<any> = new BehaviorSubject({});

    private wagetypeID: number;
    private wagetypes: WageType[] = [];
    private limitTypes: { Type: LimitType, Name: string }[] = [];

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
            super.getStateSubject('wagetype')
                .switchMap((wagetype: WageType) => {
                    if (wagetype.ID !== this.wagetypeID) {
                        this.wagetypeID = wagetype.ID;
                        return this.setup(wagetype);
                    } else {
                        return Observable.of(wagetype);
                    }
                })
                .subscribe((wagetype: WageType) => {
                    this.wageType$.next(wagetype);
                });
        });
    }

    private change(event) {
        let wagetype = this.wageType$.getValue();
        this.updateFields(wagetype);
        super.updateState('wagetype', wagetype, true);
    }

    private setup(wagetype: WageType) {
        return Observable
            .forkJoin(this.getSources())
            .map((response: any) => {
                let [layout, wagetypes, limitTypes] = response;
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
                this.wagetypes = wagetypes;
                this.limitTypes = limitTypes;
                this.updateFields(wagetype);
                return wagetype;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private getSources() {
        return [
            this.wagetypeService.specialSettingsLayout('wagetypeSettings'),
            this.wagetypeService.GetAll(null),
            this.wagetypeService.getLimitTypes()
        ];
    }

    private updateFields(wagetype: WageType) {
        this.fields$
            .take(1)
            .map(fields => {
                this.editField(fields, 'Limit_type', limitType => {
                    limitType.Options = {
                        source: this.limitTypes,
                        valueProperty: 'Type',
                        template: (obj: any) => obj
                            ? `${obj.Type} - ${obj.Name}`
                            : '',
                        debounceTime: 500
                    };
                });

                this.editField(fields, 'Limit_WageTypeNumber', limitWagetypeNumber => {
                    limitWagetypeNumber.Options = {
                        source: this.wagetypes,
                        valueProperty: 'WageTypeNumber',
                        template: (wagetype: WageType) => wagetype
                            ? `${wagetype.WageTypeNumber} - ${wagetype.WageTypeName}`
                            : ''
                    };
                    limitWagetypeNumber.ReadOnly = !!wagetype.Limit_newRate;
                });

                this.editField(fields, 'Limit_newRate', newrate => {
                    newrate.ReadOnly = !!wagetype.Limit_WageTypeNumber;
                });

                return fields;
            })
            .subscribe(fields => this.fields$.next(fields));
    }

    private editField(fields: any[], prop: string, edit: (field: any) => void) {
        fields.map(field => {
            if (field.Property === prop) {
                edit(field);
            }
        });
    }
}
