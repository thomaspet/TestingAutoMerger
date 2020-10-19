import {Component, ViewChild, SimpleChanges, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WageTypeService, WageTypeBaseOptions, UniCacheService, ErrorService, PageStateService} from '@app/services/services';
import { UniFieldLayout, UniForm } from '@uni-framework/ui/uniform';
import { UniView } from '@uni-framework/core/uniView';
import { WageType, code, GetRateFrom, TaxType, WageTypeSupplement } from '@uni-entities';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { WageTypeViewService } from '@app/components/salary/wage-type/shared/services/wage-type-view.service';
import { IncomeService } from '@app/components/salary/wage-type/shared/services/income.service';
import { BehaviorSubject, Observable } from 'rxjs';

const WAGETYPE_KEY = 'wagetype';

interface IValidValuesFilter {
    IncomeType?: string;
    Benefit?: string;
    Description?: string;
    taxAndContributionRule?: string;
}

interface IIncomeType {
    text: string;
}

interface IBenefit {
    text: string;
}

interface IDescription {
    fordel?: string;
    text: string;
}

interface IUniFormTabEvent {
    event: KeyboardEvent;
    prev: UniFieldLayout;
    next: UniFieldLayout;
}

@Component({
  selector: 'uni-wage-type-details',
  templateUrl: './wage-type-details.component.html',
  styleUrls: ['./wage-type-details.component.sass']
})
export class WageTypeDetailsComponent extends UniView {

    private aMeldingHelp: string = 'https://www.skatteetaten.no/bedrift-og-organisasjon/arbeidsgiver/a-meldingen/veiledning/';
    public wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    private wagetypeID: number;
    private incomeTypeDatasource: IIncomeType[] = [];
    private benefitDatasource: IBenefit[] = [];
    private descriptionDatasource: IDescription[] = [];
    private validValuesTypes: any[] = [];

    private supplementPackages: code[] = [];

    public tilleggspakkeConfig: UniTableConfig;
    public showSupplementaryInformations: boolean = false;
    private hidePackageDropdown: boolean = true;
    private rateIsReadOnly: boolean;
    private basePayment: boolean;
    public config$: BehaviorSubject<any> = new BehaviorSubject({
        autofocus: true,
        submitText: '',
        sections: {
            '1': { isOpen: true },
            '2': { isOpen: true }
        }
    });
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    public busy: boolean;

    @ViewChild(UniForm, { static: true }) public uniform: UniForm;

    private getRateFrom: { ID: GetRateFrom, Name: string }[] = [
        { ID: GetRateFrom.WageType, Name: 'Lønnsart' },
        { ID: GetRateFrom.MonthlyPayEmployee, Name: 'Månedslønn ansatt' },
        { ID: GetRateFrom.HourlyPayEmployee, Name: 'Timelønn ansatt' },
        { ID: GetRateFrom.FreeRateEmployee, Name: 'Frisats ansatt' }
    ];


    private taxType: Array<any> = [
        { ID: TaxType.Tax_None, Name: 'Ingen' },
        { ID: TaxType.Tax_Table, Name: 'Tabelltrekk' },
        { ID: TaxType.Tax_Percent, Name: 'Prosenttrekk' },
        { ID: TaxType.Tax_0, Name: 'Trekkplikt uten skattetrekk' }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private inntektService: IncomeService,
        public cacheService: UniCacheService,
        private errorService: ErrorService,
        private wageTypeService: WageTypeService,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private wageTypeViewService: WageTypeViewService,
    ) {

        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject(WAGETYPE_KEY)
                .switchMap((wageType: WageType) => {
                    if (wageType.ID !== this.wagetypeID) {
                        this.wagetypeID = wageType.ID;
                        this.rateIsReadOnly = wageType.GetRateFrom !== GetRateFrom.WageType;

                        this.incomeTypeDatasource = [];
                        this.benefitDatasource = [];
                        this.descriptionDatasource = [];
                        this.supplementPackages = [];

                        return this.setup(wageType);
                    } else {
                        return Observable.of(wageType);
                    }
                })
                .subscribe((wageType: WageType) => {
                    wageType['_baseOptions'] = this.getBaseOptions(wageType);
                    this.wageType$.next(wageType);
                    this.tabService.addTab({
                        name: wageType.WageTypeNumber ? 'Lønnsartnr. ' + wageType.WageTypeNumber : 'Ny lønnsart',
                        url: this.pageStateService.getUrl(),
                        moduleID: UniModules.Wagetypes,
                        active: true
                    });
                }, err => this.errorService.handle(err));
        });
    }

    private getBaseOptions(wageType: WageType): WageTypeBaseOptions[] {
        const baseOptions = [];
        if (wageType.Base_Vacation) {
            baseOptions.push(WageTypeBaseOptions.VacationPay);
        }

        if (wageType.Base_EmploymentTax) {
            baseOptions.push(WageTypeBaseOptions.AGA);
        }

        return baseOptions;
    }

    private setBaseOptionsOnWagetype(wageType: WageType, baseOptions: WageTypeBaseOptions[]): void {
        wageType.Base_Vacation = baseOptions.some(x => x === WageTypeBaseOptions.VacationPay);
        wageType.Base_EmploymentTax = baseOptions.some(x => x === WageTypeBaseOptions.AGA);
    }

    private getSetupSources(wageType: WageType) {
        const sources = [
            <Observable<any>>this.wageTypeService.layout('WagetypeDetails', this.wageType$),
            this.inntektService.getSalaryValidValueTypes()
        ];

        if (wageType.WageTypeNumber) {
            sources.push(this.wageTypeService.usedInPayrollrun(wageType.WageTypeNumber));
        }
        return sources;
    }

    private setup(wageType: WageType): Observable<WageType> {
        const sources = this.getSetupSources(wageType);
        return Observable
            .forkJoin(sources)
            .map((response: [any, any[], boolean]) => {
                const [layout, validvaluesTypes, usedInPayrollrun] = response;
                const fields = layout.Fields;
                this.validValuesTypes = validvaluesTypes;
                this.extendFields(usedInPayrollrun, fields, wageType);
                this.checkAmeldingInfo(wageType, fields);
                this.fields$.next(this.updateUniformFields(fields));
                return wageType;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private extendFields(calculatedRun: boolean, fields: any[], wageType: WageType) {
        this.basePayment = wageType.Base_Payment;
        fields = this.wageTypeService.manageReadOnlyIfCalculated(fields, calculatedRun);
        this.setReadOnlyOnField(fields, 'Rate', this.rateIsReadOnly);
        this.setReadOnlyOnField(fields, 'WageTypeNumber', !!wageType.ID);
        this.setReadOnlyOnField(fields, 'AccountNumber_balance', wageType.Base_Payment);

        this.editField(fields, 'taxtype', taxtype => {
            taxtype.Options = {
                source: this.taxType,
                template: (obj) => obj.Name,
                displayProperty: 'Name',
                valueProperty: 'ID',
                debounceTime: 500,
            };
        });
        this.editField(fields, 'GetRateFrom', getRateFrom => {
            getRateFrom.Options = {
                source: this.getRateFrom,
                displayProperty: 'Name',
                valueProperty: 'ID'
            };
        });

        return fields;
    }

    private editField(fields: any[], prop: string, edit: (field: any) => void) {
        fields.map(field => {
            if (field.Property === prop) {
                edit(field);
            }
        });
    }

    private checkAmeldingInfo(wageType: WageType, fields: any[]) {
        const hasSupplements = (wageType.SupplementaryInformations
            && wageType.SupplementaryInformations.length > 0);

        this.showSupplementaryInformations = hasSupplements;
        this.setFieldHidden(fields, 'SupplementPackage', !hasSupplements);

        if (wageType.Benefit) {
            this.benefitDatasource.push({ text: wageType.Benefit });
        }

        if (wageType.Description) {
            this.descriptionDatasource.push({ text: wageType.Description });
        }

        this.setupTypes(this.validValuesTypes);
        this.setReadOnlyOnBenefitAndDescription(fields, wageType.IncomeType);
        if (!!wageType.IncomeType) {
            this.handleSupplementPackages(wageType, fields);
        }

        wageType['_AMeldingHelp'] = this.aMeldingHelp;

        this.setupTilleggspakkeConfig();
    }

    private setFieldHidden(fields: any[], prop: string, isHidden) {
        fields.map(field => {
            if (field.Property === prop) {
                field.Hidden = isHidden;
            }
        });
        return fields;
    }

    private updateUniformFields(fields: any[], supplementPackages: any[] = null) {
        fields = fields || this.fields$.getValue();
        supplementPackages = supplementPackages || this.supplementPackages;

        this.editField(fields, 'IncomeType', incomeType => {
            incomeType.Options = {
                source: this.incomeTypeDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
            };
        });

        this.editField(fields, 'Benefit', benefit => {
            benefit.Options = {
                source: this.benefitDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
            };
        });

        this.editField(fields, 'Description', description => {
            description.Options = {
                source: this.descriptionDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
            };
        });

        this.editField(fields, 'SupplementPackage', tilleggsinfo => {
            tilleggsinfo.Options = {
                source: supplementPackages,
                valueProperty: 'uninavn',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.uninavn}` : ''
            };
            tilleggsinfo.ReadOnly = this.hidePackageDropdown;
        });

        if (supplementPackages) {
            this.fields$.next(fields);
        }

        return fields;
    }

    private setupTypes(types: any[]) {
        types.forEach(tp => {
            this.incomeTypeDatasource.push({ text: tp });
        });
    }

    private handleSupplementPackages(
        wageType: WageType,
        fields?: any[]): WageType {
        const filter: IValidValuesFilter = {
            IncomeType: (wageType && wageType.IncomeType) || '',
            Benefit: (wageType && wageType.Benefit) || '',
            Description: (wageType && wageType.Description) || '',
            taxAndContributionRule: this.wageTypeViewService
                .getTaxAndContributionRuleAmeldingName(wageType && wageType.SpecialTaxAndContributionsRule)
        };
        fields = fields || this.fields$.getValue();

        this.inntektService
            .getSalaryValidValue(filter.IncomeType)
            .filter(response => !!response)
            .map(response => this.setBenefitAndDescriptionSource(response, filter))
            .map(response => this.filterTilleggsPakker(response, filter))
            .map(response => this.setupTilleggsPakker(response, filter))
            .do(response => {
                this.setFieldHidden(fields, 'SupplementPackage', !filter.Description || !response.length);
                this.updateUniformFields(fields, response);
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
            .subscribe(response => this.supplementPackages = response);

        return wageType;
    }

    private setBenefitAndDescriptionSource(supplementPackages: code[], filter: IValidValuesFilter) {
        this.benefitDatasource = [];
        this.descriptionDatasource = [];

        const _filter: IValidValuesFilter = {
            IncomeType: filter.IncomeType,
            Benefit: filter.Benefit
        };

        supplementPackages.forEach(tp => {
            if (!this.benefitDatasource.some(x => x.text === tp.fordel)) {
                this.benefitDatasource.push({ text: tp.fordel });
            }

            const incometypeChild: any = this.getIncometypeChildObject(tp, _filter);

            if (incometypeChild) {
                if (!this.descriptionDatasource.some(x => x.text === incometypeChild.beskrivelse)) {
                    this.descriptionDatasource.push({ text: incometypeChild.beskrivelse, fordel: tp.fordel });
                }
            }
        });


        this.benefitDatasource = this.benefitDatasource.filter(benefit => !!benefit.text);
        this.descriptionDatasource = this.descriptionDatasource.filter(description => !!description.text);

        return supplementPackages;
    }

    private getIncometypeChildObject(tp: code, filter: IValidValuesFilter) {
        const wageType = this.wageType$.getValue();
        filter = filter || {
            IncomeType: wageType.IncomeType,
            Benefit: wageType.Benefit,
            Description: wageType.Description
        };

        let incometypeChild: any;
        if (filter.IncomeType) {
            switch (filter.IncomeType.toLowerCase()) {
                case 'lønn':
                    incometypeChild = tp.loennsinntekt;
                    break;
                case 'ytelsefraoffentlige':
                    incometypeChild = tp.ytelseFraOffentlige;
                    break;
                case 'pensjonellertrygd':
                    incometypeChild = tp.pensjonEllerTrygd;
                    break;
                case 'næringsinntekt':
                    incometypeChild = tp.naeringsinntekt;
                    break;
                case 'fradrag':
                    incometypeChild = tp.fradrag;
                    break;
                case 'forskuddstrekk':
                    incometypeChild = tp.forskuddstrekk;
                    break;
                case 'utleggstrekk':
                    incometypeChild = tp.utleggstrekk;
                    break;
                default:
                    break;
            }

            if (incometypeChild
                && filter.Benefit
                // && !filter.Description
                && filter.Benefit.toLowerCase() !== 'fradrag'
                && filter.Benefit.toLowerCase() !== 'forskuddstrekk') {
                incometypeChild = tp.fordel === filter.Benefit ? incometypeChild : undefined;
            }

            if (incometypeChild && filter.Description) {
                incometypeChild = incometypeChild.beskrivelse === filter.Description ? incometypeChild : undefined;
            }
        }

        return incometypeChild;
    }

    private updateForSkatteOgAvgiftregel(supplementPackages: any[], rule: string) {
        const filtered: any[] = [];
        supplementPackages.forEach(pack => {
            if (pack.skatteOgAvgiftregel === rule) {
                filtered.push(pack);
            }
        });

        supplementPackages = filtered;
        return filtered;
    }

    private setupTilleggsPakker(supplementPackages: code[], filter: IValidValuesFilter) {
        let packs: any[] = [];
        // Ta bort alle objekter som har 'skatteOgAvgiftsregel' som noe annet enn null
        supplementPackages = this.updateForSkatteOgAvgiftregel(supplementPackages, filter.taxAndContributionRule);

        supplementPackages.forEach(tp => {
            const incometypeChild: any = this.getIncometypeChildObject(tp, filter);
            if (incometypeChild) {
                const additions: WageTypeSupplement[] = this.addTilleggsInformasjon(incometypeChild);
                if (additions.length > 0) {
                    packs.push({ uninavn: tp.uninavn, additions: additions });
                }
            }
        });
        packs = packs.filter(pack => !!pack && pack.uninavn);
        this.hidePackageDropdown = packs.length > 0 ? false : true;

        if (packs.length > 0) {
            packs.unshift({ uninavn: 'Ingen', additions: [] });
        }

        return packs;
    }

    private filterTilleggsPakker(supplementPackages: code[], filter: IValidValuesFilter) {
        return supplementPackages.filter(tp => !!this.getIncometypeChildObject(tp, filter));
    }

    private addTilleggsInformasjon(tillegg) {
        const tilleggsObj: any = tillegg.tilleggsinformasjon;
        const spesiObj: any = tillegg.spesifikasjon;
        const additions: WageTypeSupplement[] = [];

        if (tilleggsObj !== null) {
            for (const key in tilleggsObj) {
                if (key !== null) {
                    const obj = tilleggsObj[key];
                    if (typeof obj === 'object' && obj !== null) {
                        for (const prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                if (obj[prop] !== null) {
                                    const wtSupp: WageTypeSupplement = new WageTypeSupplement();
                                    wtSupp.Name = prop;
                                    wtSupp.ameldingType = key;
                                    wtSupp.SuggestedValue = this.removeAndReturnValue(obj[prop]);
                                    wtSupp.WageTypeID = this.wageType$.getValue().ID;
                                    wtSupp['_createguid'] = this.wageTypeService.getNewGuid();
                                    additions.push(wtSupp);
                                }
                            }
                        }
                    } else if (obj !== null) {
                        const wtSupp: WageTypeSupplement = new WageTypeSupplement();
                        wtSupp.Name = key;
                        wtSupp.ameldingType = key;
                        wtSupp.SuggestedValue = this.removeAndReturnValue(obj);
                        wtSupp.WageTypeID = this.wageType$.getValue().ID;
                        wtSupp['_createguid'] = this.wageTypeService.getNewGuid();
                        additions.push(wtSupp);
                    }
                }
            }
        }

        if (spesiObj !== null) {
            for (const props in spesiObj) {
                if (spesiObj.hasOwnProperty(props)) {
                    if (spesiObj[props] !== null) {
                        const wtSupp: WageTypeSupplement = new WageTypeSupplement();
                        wtSupp.Name = props;
                        wtSupp.SuggestedValue = this.removeAndReturnValue(spesiObj[props]);
                        wtSupp.WageTypeID = this.wageType$.getValue().ID;
                        wtSupp['_createguid'] = this.wageTypeService.getNewGuid();
                        additions.push(wtSupp);
                    }
                }
            }
        }

        return additions;
    }

    private removeAndReturnValue(value: string) {

        if (value !== null && typeof value === 'string') {
            switch (value.toString().toLowerCase()) {
                case 'ja/nei':
                    value = '';
                    break;
                case 'utfylt':
                    value = '';
                    break;
                case '1':
                    value = '';
                    break;

                default:
                    break;
            }
        } else {
            value = '';
        }

        return value;
    }

    private showTilleggsPakker(wageType: WageType, fields: any[]): void {
        const selectedPackage: any = this.supplementPackages.find(x => x.uninavn === wageType.SupplementPackage);
        this.showSupplementaryInformations = false;

        if (selectedPackage) {
            const supInfo: WageTypeSupplement[] = [];
            selectedPackage.additions.forEach(addition => {
                supInfo.push(addition);
            });

            this.setDeleteOnDuplicates(supInfo, wageType);

            if (!!wageType.SupplementaryInformations.length && supInfo.length) {
                this.showSupplementaryInformations = true;
                fields.map(field => {
                    if (field.Property === 'SupplementPackage') {
                        field.Hidden = false;
                    }
                });
            }
        }
    }

    private setDeleteOnDuplicates(additions: WageTypeSupplement[], wageType: WageType): void {
        wageType.SupplementaryInformations = wageType.SupplementaryInformations.filter(x => x.ID);

        if (wageType.SupplementaryInformations && wageType.SupplementaryInformations.length) {
            for (let g = 0; g < wageType.SupplementaryInformations.length; g++) {
                wageType.SupplementaryInformations[g]['_setDelete'] = true;
            }
        }

        const array = wageType.SupplementaryInformations.concat(JSON.parse(JSON.stringify(additions)));

        // ensure no duplicates
        for (let i = array.length - 1; i > 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                if (array[i].Name === array[j].Name) {
                    array[j]['_setDelete'] = true;
                    break;
                }
            }
        }
        wageType.SupplementaryInformations = array;
    }

    private setupTilleggspakkeConfig() {
        const tilleggsopplysning = new UniTableColumn('Name', 'Tilleggsopplysning', UniTableColumnType.Text);
        tilleggsopplysning.editable = false;
        const suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text)
            .setTemplate((supplement: WageTypeSupplement) => {
                return (supplement?.SuggestedValue) ? supplement.SuggestedValue : '';
            });

        this.tilleggspakkeConfig = new UniTableConfig('salary.wagetype.details.tilleggspakke', true, true, 15)
            .setFilters([
                { field: '_setDelete', operator: 'ne', value: 'true', group: 0 },
                { field: 'Deleted', operator: 'ne', value: 'true', group: 0 }
            ])
            .setColumns([tilleggsopplysning, suggestedValue])
            .setAutoAddNewRow(false)
            .setChangeCallback(event => {
                this.wageType$
                    .asObservable()
                    .take(1)
                    .map(wt => {
                        const suppIndex = wt.SupplementaryInformations
                            .findIndex(x => x['_originalIndex'] === event['originalIndex']);
                        wt.SupplementaryInformations[suppIndex] = event.rowModel;
                        return wt;
                    })
                    .subscribe(wt => super.updateState('wagetype', wt, true));
                return event.rowModel;
            });
    }

    public change(changes: SimpleChanges) {
        Observable
            .combineLatest(this.wageType$, this.fields$)
            .take(1)
            .filter(() => Object
                .keys(changes)
                .some(key => {
                    const change = changes[key];
                    return change.previousValue !== change.currentValue || key === 'IncomeType';
                }))
            .map((result: [WageType, any[]]) => {
                const [wageType, fields] = result;

                this.handleAmeldingEvents(wageType, changes);

                if (changes['WageTypeNumber']) {
                    if (!isNaN(changes['WageTypeNumber'].currentValue)) {
                        const currVal = Math.abs(Math.floor(changes['WageTypeNumber'].currentValue));
                        wageType.WageTypeNumber = currVal;
                        this.busy = true;

                        this.wageTypeService.getOrderByWageTypeNumber(
                            `filter=WageTypeNumber eq ${currVal}`
                            + `&top=1&hateoas=false`, null, '&ValidYear desc')
                            .finally(() => this.busy = false)
                            .subscribe(wts => {
                                const wt = wts[0];
                                if (!!wt) {
                                    super.updateState(WAGETYPE_KEY, wt, false);
                                    this.router.navigateByUrl(`/salary/wagetypes/${wt.ID}`);
                                }
                            });
                    }
                }

                if (changes['taxtype'] || changes['Base_Payment']) {
                    this.checkHideFromPaycheck(wageType);
                }

                if (changes['GetRateFrom']) {
                    this.setReadOnlyOnField(
                        fields,
                        'Rate',
                        changes['GetRateFrom'].currentValue !== GetRateFrom.WageType);
                }

                if (changes['Base_Payment']) {
                    const basePayment = changes['Base_Payment'].currentValue;
                    this.setReadOnlyOnField(fields, 'HideFromPaycheck', basePayment);
                    this.setReadOnlyOnField(fields, 'AccountNumber_balance', basePayment);
                }

                if (changes['SupplementPackage']) {
                    this.showTilleggsPakker(wageType, fields);
                }

                if (changes['_baseOptions']) {
                    const baseOptions = changes['_baseOptions'].currentValue;
                    this.setBaseOptionsOnWagetype(wageType, baseOptions);
                    this.wageTypeService.wagetypeMaintainanceNotify(wageType);
                }

                if (changes['IncomeType']) {
                    this.setReadOnlyOnBenefitAndDescription(fields, changes['IncomeType'].currentValue);
                    this.setFieldHidden(fields, 'SupplementPackage', true);
                }

                if (changes['Benefit']) {
                    this.setFieldHidden(fields, 'SupplementPackage', true);
                }

                if (changes['Description']) {
                    this.setFieldHidden(fields, 'SupplementPackage', this.supplementPackages.length);
                }

                if (changes['Base_Payment']
                    || changes['Benefit']
                    || changes['Description']
                    || changes['IncomeType']
                    || changes['SpecialAgaRule']
                    || changes['taxtype']
                    || changes['WageTypeNumber']
                    || changes['SupplementPackage']) {
                    this.wageTypeService.wagetypeMaintainanceNotify(wageType);
                }

                return [wageType, fields];
            })
            .subscribe((result: [WageType, any[]]) => {
                const [wageType, fields] = result;
                this.fields$.next(fields);
                super.updateState('wagetype', wageType, true);
            });
    }

    private handleAmeldingEvents(model: WageType, event: SimpleChanges): WageType {
        if (!event['IncomeType'] && !event['Benefit'] && !event['Description']) {
            return model;
        }
        this.showSupplementaryInformations = !!event['Description'];
        model.Benefit = event['IncomeType'] ? '' : model.Benefit;
        model.Description = !event['Description'] ? '' : model.Description;
        return this.handleSupplementPackages(model);
    }

    private checkHideFromPaycheck(wageType: WageType): WageType {
        if (!wageType.HideFromPaycheck) {
            return wageType;
        }
        wageType.HideFromPaycheck = wageType.HideFromPaycheck && !(wageType.Base_Payment ||
            wageType.taxtype === TaxType.Tax_Percent ||
            wageType.taxtype === TaxType.Tax_Table);
        return wageType;
    }

    private setReadOnlyOnBenefitAndDescription(fields: any[], value: string) {
        const benefitAndDescriptionReadOnly = !value;
        this.setReadOnlyOnField(fields, 'Benefit', benefitAndDescriptionReadOnly);
        this.setReadOnlyOnField(fields, 'Description', benefitAndDescriptionReadOnly);
    }

    private setReadOnlyOnField(fields: any[], prop: string, readOnly: boolean) {
        fields.map(field => {
            if (field.Property === prop) {
                field.ReadOnly = readOnly;
            }
        });
    }

    public toggle(section) {
        if (section.sectionId === 2) {
            if (section.isOpen) {
                if (this.wageType$.getValue().SupplementaryInformations.length > 0) {
                    this.showSupplementaryInformations = true;
                }
            } else {
                this.showSupplementaryInformations = false;
            }
        }
    }
}
