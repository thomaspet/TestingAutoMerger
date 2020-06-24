import { Component, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { BehaviorSubject, Observable } from 'rxjs';
import { WageType, LimitType, StdWageType, SpecialAgaRule, TaxType } from '@uni-entities';
import { UniForm } from '@uni-framework/ui/uniform';
import { ActivatedRoute, Router } from '@angular/router';
import { WageTypeService, ErrorService, UniCacheService, PageStateService } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { WAGETYPE_TRANSLATION_KEY, DIRTY_KEY } from '@app/components/salary/wage-type/shared/services/wage-type-view.service';

@Component({
  selector: 'uni-wage-type-settings',
  templateUrl: './wage-type-settings.component.html',
  styleUrls: ['./wage-type-settings.component.sass']
})
export class WageTypeSettingsComponent extends UniView {

    public wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public config$: BehaviorSubject<any> = new BehaviorSubject({});

    @ViewChild(UniForm, { static: true }) public uniform: UniForm;

    private wagetypeID: number;
    private limitTypes: { Type: LimitType, Name: string }[] = [];

    private stdWageType: Array<any> = [
        { ID: StdWageType.None, Name: 'Ingen' },
        { ID: StdWageType.TaxDrawTable, Name: 'Tabelltrekk' },
        { ID: StdWageType.TaxDrawPercent, Name: 'Prosenttrekk' },
        { ID: StdWageType.HolidayPayWithTaxDeduction, Name: 'Feriepenger med skattetrekk' },
        { ID: StdWageType.HolidayPayThisYear, Name: 'Feriepenger i år' },
        { ID: StdWageType.HolidayPayLastYear, Name: 'Feriepenger forrige år' },
        { ID: StdWageType.HolidayPayEarlierYears, Name: 'Feriepenger tidligere år' },
        { ID: StdWageType.AdvancePayment, Name: 'Forskudd' },
        { ID: StdWageType.Contribution, Name: 'Bidragstrekk' },
        { ID: StdWageType.Garnishment, Name: 'Utleggstrekk skatt' },
        { ID: StdWageType.Outlay, Name: 'Utleggstrekk' },
        { ID: StdWageType.SourceTaxPension, Name: 'Forskuddstrekk kildeskatt på pensjon' }
    ];

    private specialAgaRule: { ID: SpecialAgaRule, Name: string }[] = [
        { ID: SpecialAgaRule.Regular, Name: 'Vanlig' },
        { ID: SpecialAgaRule.AgaRefund, Name: 'Aga refusjon' },
        { ID: SpecialAgaRule.AgaPension, Name: 'Aga pensjon' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private wagetypeService: WageTypeService,
        private errorService: ErrorService,
        protected cacheService: UniCacheService,
        private tabService: TabService,
        private pageStateService: PageStateService
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
                    this.tabService.addTab({
                        name: wagetype.WageTypeNumber ? 'Lønnsartnr. ' + wagetype.WageTypeNumber : 'Ny lønnsart',
                        url: this.pageStateService.getUrl(),
                        moduleID: UniModules.Wagetypes,
                        active: true
                    });
                });
        });
    }

    public change(changes: SimpleChanges) {
        const wagetype = this.wageType$.getValue();
        if (changes['SpecialAgaRule']) {
            this.wagetypeService.wagetypeMaintainanceNotify(wagetype);
        }
        if (changes[`${WAGETYPE_TRANSLATION_KEY}.WageTypeName`]) {
            wagetype[WAGETYPE_TRANSLATION_KEY][DIRTY_KEY] = true;
        }
        this.updateFields(wagetype);
        super.updateState('wagetype', wagetype, true);
    }

    private setup(wagetype: WageType) {
        return Observable
            .forkJoin(this.getSources(wagetype))
            .map((response: any) => {
                const [layout, limitTypes, used] = response;
                layout.Fields = this.wagetypeService.manageReadOnlyIfCalculated(layout.Fields, used);
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
                this.limitTypes = limitTypes;
                this.extendFields(layout.Fields, wagetype);
                this.updateFields(wagetype);
                return wagetype;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }
    private extendFields(fields: any[], wagetype: WageType)    {

        this.editField(fields, 'SpecialAgaRule', specialAgaRule => {
            specialAgaRule.Options = {
                source: this.specialAgaRule,
                displayProperty: 'Name',
                valueProperty: 'ID',
                debounceTime: 500
            };
        });

        this.editField(fields, 'StandardWageTypeFor', standardWageTypeFor => {
            standardWageTypeFor.Options = {
                source: this.stdWageType,
                displayProperty: 'Name',
                valueProperty: 'ID'
            };
        });

    }

    private editField(fields: any[], prop: string, edit: (field: any) => void) {
        fields.map(field => {
            if (field.Property === prop) {
                edit(field);
            }
        });
    }


    private getSources(wagetype: WageType): any {
        const source =  [
            this.wagetypeService.specialSettingsLayout('wagetypeSettings', this.wagetypeService.getOrderByWageTypeNumber()),
            this.wagetypeService.getLimitTypes()
        ];

        if (wagetype.WageTypeNumber) {
            source.push(this.wagetypeService.usedInPayrollrun(wagetype.WageTypeNumber));
        }

        return source;
    }

    private updateFields(wagetype: WageType) {
        this.fields$
            .asObservable()
            .take(1)
            .map(fields => {

                this.editField(fields, 'Limit_WageTypeNumber', limitWagetypeNumber => {
                    limitWagetypeNumber.ReadOnly = !!wagetype.Limit_newRate;
                });

                this.editField(fields, 'Limit_newRate', newrate => {
                    newrate.ReadOnly = !!wagetype.Limit_WageTypeNumber;
                });

                this.editField(fields, 'HideFromPaycheck', hideFromPaycheck => {
                    hideFromPaycheck.ReadOnly = !!(wagetype.Base_Payment ||
                        wagetype.taxtype === TaxType.Tax_Percent ||
                        wagetype.taxtype === TaxType.Tax_Table);
                });

                this.editField(fields, 'Systemtype', systype => {
                    systype.ReadOnly = true;
                });

                return fields;
            })
            .subscribe(fields => this.fields$.next(fields));
    }
}
