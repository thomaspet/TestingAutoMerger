import {Component, ViewChild, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WageTypeService, AccountService, InntektService, WageTypeBaseOptions} from '../../../../services/services';
import {UniForm, UniFieldLayout} from '../../../../../framework/ui/uniform/index';
import {
        WageType, WageTypeSupplement, SpecialTaxAndContributionsRule, GetRateFrom, TaxType, code
    } from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from '../../../../../framework/ui/unitable/index';

import {UniView} from '../../../../../framework/core/uniView';
import {UniCacheService, ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

type ValidValuesFilter = {
    IncomeType?: string,
    Benefit?: string,
    Description?: string
};

type IncomeType = {
    text: string
};

type Benefit = {
    text: string
};

type Description = {
    fordel?: string,
    text: string
};

type UniFormTabEvent = {
    event: KeyboardEvent,
    prev: UniFieldLayout,
    next: UniFieldLayout
};


@Component({
    selector: 'wagetype-details',
    templateUrl: './wagetypeDetails.html'
})
export class WagetypeDetail extends UniView {
    private aMeldingHelp: string = 'http://veiledning-amelding.smartlearn.no/Veiledn_Generell'
        + '/index.html#!Documents/lnnsinntekterrapportering.htm';
    private wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    private wagetypeID: number;
    private incomeTypeDatasource: IncomeType[] = [];
    private benefitDatasource: Benefit[] = [];
    private descriptionDatasource: Description[] = [];
    private validValuesTypes: any[] = [];

    private supplementPackages: code[] = [];

    private tilleggspakkeConfig: UniTableConfig;
    private showSupplementaryInformations: boolean = false;
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

    @ViewChild(UniForm) public uniform: UniForm;

    private specialTaxAndContributionsRule: { ID: SpecialTaxAndContributionsRule, Name: string }[] = [
        { ID: SpecialTaxAndContributionsRule.Standard, Name: 'Standard/ingen valgt' },
        { ID: SpecialTaxAndContributionsRule.Svalbard, Name: 'Svalbard' },
        { ID: SpecialTaxAndContributionsRule.JanMayenAndBiCountries, Name: 'Jan Mayen og bilandene' },
        { ID: SpecialTaxAndContributionsRule.NettoPayment, Name: 'Netto lønn' },
        { ID: SpecialTaxAndContributionsRule.NettoPaymentForMaritim, Name: 'Nettolønn for sjøfolk' },
        { ID: SpecialTaxAndContributionsRule.PayAsYouEarnTaxOnPensions, Name: 'Kildeskatt for pensjonister' }
    ];

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
        private wageService: WageTypeService,
        private accountService: AccountService,
        private inntektService: InntektService,
        public cacheService: UniCacheService,
        private errorService: ErrorService
    ) {

        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('wagetype')
                .switchMap((wageType: WageType) => {
                    if (wageType.ID !== this.wagetypeID) {
                        this.wagetypeID = wageType.ID;
                        this.rateIsReadOnly = wageType.GetRateFrom !== GetRateFrom.WageType;

                        this.incomeTypeDatasource = [];
                        this.benefitDatasource = [];
                        this.descriptionDatasource = [];
                        this.supplementPackages = [];

                        if (!wageType.ID) {
                            this.setDefaultValues(wageType);
                        }

                        return this.setup(wageType);
                    } else {
                        return Observable.of(wageType);
                    }
                })
                .subscribe((wageType: WageType) => {
                    wageType['_baseOptions'] = this.getBaseOptions(wageType);
                    this.wageType$.next(wageType);
                }, err => this.errorService.handle(err));
        });
    }

    private setDefaultValues(wageType: WageType) {
        wageType.taxtype = TaxType.Tax_Table;
        wageType.Base_Vacation = true;
        wageType.Base_EmploymentTax = true;
        wageType.Base_div1 = true;
    }

    private getBaseOptions(wageType: WageType): WageTypeBaseOptions[] {
        const baseOptions = [];
        if (wageType.Base_Vacation) {
            baseOptions.push(WageTypeBaseOptions.VacationPay);
        }

        if (wageType.Base_EmploymentTax) {
            baseOptions.push(WageTypeBaseOptions.AGA);
        }

        if (wageType.Base_div1) {
            baseOptions.push(WageTypeBaseOptions.Pension);
        }

        return baseOptions;
    }

    private setBaseOptionsOnWagetype(wageType: WageType, baseOptions: WageTypeBaseOptions[]): void {
        wageType.Base_Vacation = baseOptions.some(x => x === WageTypeBaseOptions.VacationPay);
        wageType.Base_EmploymentTax = baseOptions.some(x => x === WageTypeBaseOptions.AGA);
        wageType.Base_div1 = baseOptions.some(x => x === WageTypeBaseOptions.Pension);
    }

    private getSetupSources(wageType: WageType) {
        const sources = [
            <Observable<any>>this.wageService.layout('WagetypeDetails', this.wageType$),
            this.inntektService.getSalaryValidValueTypes()
        ];

        if (wageType.WageTypeNumber) {
            sources.push(this.wageService.usedInPayrollrun(wageType.WageTypeNumber));
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
        fields = this.wageService.manageReadOnlyIfCalculated(fields, calculatedRun);
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
                events: {
                    tab: (event) => {
                        this.uniform.field('AccountNumber').focus();
                    },
                    shift_tab: (event) => {
                        this.uniform.field('RateFactor').focus();
                    }
                }
            };
        });
        this.editField(fields, 'GetRateFrom', getRateFrom => {
            getRateFrom.Options = {
                source: this.getRateFrom,
                displayProperty: 'Name',
                valueProperty: 'ID'
            };
        });

        this.editField(fields, 'SpecialTaxAndContributionsRule', specialTaxAndContributionsRule => {
            specialTaxAndContributionsRule.Options = {
                source: this.specialTaxAndContributionsRule,
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

        if (wageType.Benefit !== '') {
            this.benefitDatasource.push({ text: wageType.Benefit });
        }

        if (wageType.Description !== '') {
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
                events: {
                    select: (model: WageType) => {
                        this.showSupplementaryInformations = false;
                        model.Description = '';
                        model.Benefit = '';
                        this.handleSupplementPackages(model);
                        this.wageType$.next(model);
                        this.uniform.field('Benefit').focus();
                    }
                }
            };
        });

        this.editField(fields, 'Benefit', benefit => {
            benefit.Options = {
                source: this.benefitDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
                events: {
                    select: (model: WageType) => {
                        this.showSupplementaryInformations = false;
                        model.Description = '';
                        this.handleSupplementPackages(model);
                        this.wageType$.next(model);
                        this.uniform.field('Description').focus();
                    }
                }
            };
        });

        this.editField(fields, 'Description', description => {
            description.Options = {
                source: this.descriptionDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
                events: {
                    select: (model: WageType) => {
                        this.handleSupplementPackages(model);
                        this.uniform.field('SpecialTaxAndContributionsRule').focus();
                    }
                }
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
        fields?: any[]) {
        const filter: ValidValuesFilter = {
            IncomeType: (wageType && wageType.IncomeType) || '',
            Benefit: (wageType && wageType.Benefit) || '',
            Description: (wageType && wageType.Description) || ''
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
    }

    private setBenefitAndDescriptionSource(supplementPackages: code[], filter: ValidValuesFilter) {
        this.benefitDatasource = [];
        this.descriptionDatasource = [];

        const _filter: ValidValuesFilter = {
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

    private getIncometypeChildObject(tp: code, filter: ValidValuesFilter) {
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

                default:
                    break;
            }

            if (incometypeChild
                && filter.Benefit
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

    private updateForSkatteOgAvgiftregel(supplementPackages: any[]) {
        const filtered: any[] = [];
        supplementPackages.forEach(pack => {
            if (pack.skatteOgAvgiftregel === null) {
                filtered.push(pack);
            }
        });

        supplementPackages = filtered;
        return filtered;
    }

    private setupTilleggsPakker(supplementPackages: code[], filter: ValidValuesFilter) {
        let packs: any[] = [];
        // Ta bort alle objekter som har 'skatteOgAvgiftsregel' som noe annet enn null
        supplementPackages = this.updateForSkatteOgAvgiftregel(supplementPackages);

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

    private filterTilleggsPakker(supplementPackages: code[], filter: ValidValuesFilter) {
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
                                    wtSupp['_createguid'] = this.wageService.getNewGuid();
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
                        wtSupp['_createguid'] = this.wageService.getNewGuid();
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
                        wtSupp['_createguid'] = this.wageService.getNewGuid();
                        additions.push(wtSupp);
                    }
                }
            }
        }

        return additions;
    }

    private removeAndReturnValue(value: string) {

        if (value !== null) {
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
        const suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text);

        this.tilleggspakkeConfig = new UniTableConfig('salary.wagetype.details.tilleggspakke', true, true, 15)
            .setFilters([
                { field: '_setDelete', operator: 'ne', value: 'true', group: 0, searchValue: '', selectConfig: null },
                { field: 'Deleted', operator: 'ne', value: 'true', group: 0, searchValue: '', selectConfig: null }
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
                    return change.previousValue !== change.currentValue;
                }))
            .map((result: [WageType, any[]]) => {
                const [wageType, fields] = result;

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
                    wageType.HideFromPaycheck = false;
                }

                if (changes['SupplementPackage']) {
                    this.showTilleggsPakker(wageType, fields);
                }

                if (changes['_baseOptions']) {
                    const baseOptions = changes['_baseOptions'].currentValue;
                    this.setBaseOptionsOnWagetype(wageType, baseOptions);
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

                return [wageType, fields];
            })
            .subscribe((result: [WageType, any[]]) => {
                const [wageType, fields] = result;
                this.fields$.next(fields);
                super.updateState('wagetype', wageType, true);
            });
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

    public tabForward(event: UniFormTabEvent) {
        this.fields$
            .take(1)
            .filter(fields => event.prev.Placement > event.next.Placement)
            .map(fields => {
                const newNextField = fields
                    .filter(field => !field.Hidden)
                    .find(field => field.Placement > event.prev.Placement) || {};
                return newNextField.Property || '';
            })
            .subscribe(prop => {
                if (prop) {
                    this.uniform.field(prop).focus();
                }
            });
    }

    public tabBackward(event: UniFormTabEvent) {
        this.fields$
            .take(1)
            .map(fields => {
                const newPrevfield = fields
                    .filter(field => !field.Hidden)
                    .sort((fieldA, fieldB) => fieldB.Placement - fieldA.Placement)
                    .find(field => field.Placement < event.prev.Placement) || {};
                return newPrevfield.Property || '';
            })
            .subscribe(prop => {
                if (prop) {
                    this.uniform.field(prop).focus();
                }
            });
    }

}
