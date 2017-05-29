import { Component, ViewChild, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageTypeService, AccountService, InntektService, WageTypeBaseOptions } from '../../../../services/services';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import {
    WageType, Account, WageTypeSupplement, SpecialTaxAndContributionsRule, GetRateFrom,
    StdWageType, SpecialAgaRule, TaxType
} from '../../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';

import { UniView } from '../../../../../framework/core/uniView';
import { UniCacheService, ErrorService } from '../../../../services/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'wagetype-details',
    templateUrl: './wagetypeDetails.html'
})
export class WagetypeDetail extends UniView {
    private aMeldingHelp: string = 'http://veiledning-amelding.smartlearn.no/Veiledn_Generell/index.html#!Documents/lnnsinntekterrapportering.htm';
    private wageType$: BehaviorSubject<WageType> = new BehaviorSubject(new WageType());
    private wagetypeID: number;
    private accounts: Account[];
    private incomeTypeDatasource: any[] = [];
    private benefitDatasource: any[] = [];
    private descriptionDatasource: any[] = [];
    private validValuesTypes: any[] = [];

    private supplementPackages: any[] = [];
    private baseOptions: WageTypeBaseOptions[] = [];

    private tilleggspakkeConfig: UniTableConfig;
    private showSupplementaryInformations: boolean = false;
    private hidePackageDropdown: boolean = true;
    private showBenefitAndDescriptionAsReadonly: boolean = true;
    private currentPackage: string = null;
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

    private stdWageType: Array<any> = [
        { ID: StdWageType.None, Name: 'Ingen' },
        { ID: StdWageType.TaxDrawTable, Name: 'Tabelltrekk' },
        { ID: StdWageType.TaxDrawPercent, Name: 'Prosenttrekk' },
        { ID: StdWageType.HolidayPayWithTaxDeduction, Name: 'Feriepenger med skattetrekk' },
        { ID: StdWageType.HolidayPayThisYear, Name: 'Feriepenger i år' },
        { ID: StdWageType.HolidayPayLastYear, Name: 'Feriepenger forrige år' },
        { ID: StdWageType.AdvancePayment, Name: 'Forskudd' },
        { ID: StdWageType.HolidayPayEarlierYears, Name: 'Feriepenger tidligere år' }
    ];

    private specialAgaRule: { ID: SpecialAgaRule, Name: string }[] = [
        { ID: SpecialAgaRule.Regular, Name: 'Vanlig' },
        { ID: SpecialAgaRule.AgaRefund, Name: 'Aga refusjon' },
        { ID: SpecialAgaRule.AgaPension, Name: 'Aga pensjon' }
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
                        this.updateBaseOptions(wageType);

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
                    this.wageType$.next(wageType);
                }, err => this.errorService.handle(err));
        });
    }

    private updateBaseOptions(wageType: WageType) {
        this.baseOptions = [];
        if (wageType.Base_Vacation) {
            this.baseOptions.push(WageTypeBaseOptions.VacationPay);
        }
        if (wageType.Base_EmploymentTax) {
            this.baseOptions.push(WageTypeBaseOptions.AGA);
        }
        if (wageType.Base_div1) {
            this.baseOptions.push(WageTypeBaseOptions.Pension);
        }
        wageType['_baseOptions'] = this.baseOptions;
        return wageType;
    }

    private getSetupSources(wageType: WageType) {
        let sources = [
            <Observable<any>>this.wageService.layout('WagetypeDetails'),
            this.inntektService.getSalaryValidValueTypes(),
            (this.accounts && this.accounts.length ? Observable.of(this.accounts) : this.accountService.GetAll(null))
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
            .map((response: [any, any[], Account[], boolean]) => {
                let [layout, validvaluesTypes, accounts, usedInPayrollrun] = response;
                let fields = layout.Fields;
                this.accounts = accounts;
                this.validValuesTypes = validvaluesTypes;
                this.extendFields(usedInPayrollrun, fields, wageType);
                this.checkAmeldingInfo(wageType, fields);
                this.updateUniformFields(fields, false);
                this.fields$.next(fields);
                return wageType;
            })
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private extendFields(calculatedRun: boolean, fields: any[], wageType: WageType) {
        this.basePayment = wageType.Base_Payment;
        fields = this.wageService.manageReadOnlyIfCalculated(fields, calculatedRun);
        this.setReadOnlyOnField(fields, 'Rate', this.rateIsReadOnly);
        this.setReadOnlyOnField(fields, 'WageTypeNumber', !!wageType.ID);
        this.editField(fields, 'AccountNumber', (accountNumber) => {
            accountNumber.Options = {
                source: this.accounts,
                valueProperty: 'AccountNumber',
                template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            };
        });
        this.editField(fields, 'AccountNumber_balance', (accountNumberBalance) => {
            accountNumberBalance.Options = {
                source: this.accounts,
                valueProperty: 'AccountNumber',
                template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
            };
            accountNumberBalance.ReadOnly = wageType.Base_Payment;
        });
        this.editField(fields, 'SpecialAgaRule', specialAgaRule => {
            specialAgaRule.Options = {
                source: this.specialAgaRule,
                displayProperty: 'Name',
                valueProperty: 'ID',
                debounceTime: 500
            };
        });
        this.editField(fields, 'taxtype', taxtype => {
            taxtype.Options = {
                source: this.taxType,
                template: (obj) => obj.Name,
                displayProperty: 'Name',
                valueProperty: 'ID',
                debounceTime: 500,
                events: {
                    tab: (event) => {
                        this.uniform.field('StandardWageTypeFor').focus();
                    },
                    shift_tab: (event) => {
                        this.uniform.field('AccountNumber').focus();
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

        this.editField(fields, 'StandardWageTypeFor', standardWageTypeFor => {
            standardWageTypeFor.Options = {
                source: this.stdWageType,
                displayProperty: 'Name',
                valueProperty: 'ID',
                events: {
                    tab: (event) => {
                        if (this.wageType$.getValue().Base_Payment) {
                            this.uniform.field('GetRateFrom').focus();
                        } else {
                            this.uniform.field('AccountNumber_balance').focus();
                        }

                    },
                    shift_tab: (event) => {
                        this.uniform.field('taxtype').focus();
                    }
                }
            };
        });

        this.editField(fields, 'SpecialTaxAndContributionsRule', specialTaxAndContributionsRule => {
            specialTaxAndContributionsRule.Options = {
                source: this.specialTaxAndContributionsRule,
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

    private checkAmeldingInfo(wageType: WageType, fields: any[]) {
        let hasSupplements = (wageType.SupplementaryInformations
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

        if (!!wageType.IncomeType) {
            this.showBenefitAndDescriptionAsReadonly = false;
            this.filterSupplementPackages(wageType.IncomeType, true, true, true, fields);
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

    private updateUniformFields(fields: any[], refresh = true) {
        fields = fields || this.fields$.getValue();

        this.editField(fields, 'IncomeType', incomeType => {
            incomeType.Options = {
                source: this.incomeTypeDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
                events: {
                    select: (model, value) => {
                        let wageType = this.wageType$.getValue();
                        this.showSupplementaryInformations = false;
                        this.setFieldHidden(fields, 'SupplementPackage', true);
                        this.filterSupplementPackages(model.IncomeType, true, false, false);
                        this.showBenefitAndDescriptionAsReadonly = false;
                        wageType.Description = '';
                        wageType.Benefit = '';
                        this.wageType$.next(wageType);
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
                    select: (model) => {
                        let wageType = this.wageType$.getValue();
                        this.showSupplementaryInformations = false;
                        this.fields$.next(this.setFieldHidden(this.fields$.getValue(), 'SupplementPackage', true));
                        this.filterSupplementPackages(model.IncomeType, true, true, false);
                        this.setDescriptionDataSource();
                        wageType.Description = '';
                        this.wageType$.next(wageType);
                        this.uniform.field('Description').focus();
                    }
                }
            };
            benefit.ReadOnly = this.showBenefitAndDescriptionAsReadonly;
        });

        this.editField(fields, 'Description', description => {
            description.Options = {
                source: this.descriptionDatasource,
                valueProperty: 'text',
                displayProperty: 'text',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.text}` : '',
                events: {
                    select: (model) => {
                        this.filterSupplementPackages(model.IncomeType, true, true, true);
                        this.fields$
                            .next(this.setFieldHidden(
                                this.fields$.getValue(),
                                'SupplementPackage',
                                !this.supplementPackages.length));

                        this.uniform.field('SpecialTaxAndContributionsRule').focus();
                    }
                }
            };
            description.ReadOnly = this.showBenefitAndDescriptionAsReadonly;
        });

        this.editField(fields, 'SupplementPackage', tilleggsinfo => {
            tilleggsinfo.Options = {
                source: this.supplementPackages,
                valueProperty: 'uninavn',
                displayProperty: 'uninavn',
                debounceTime: 200,
                template: (obj) => obj ? `${obj.uninavn}` : ''
            };
            tilleggsinfo.ReadOnly = this.hidePackageDropdown;
        });

        if (refresh) {
            this.fields$.next(fields);
        }
    }

    private setupTypes(types: any[]) {
        types.forEach(tp => {
            this.incomeTypeDatasource.push({ text: tp });
        });
    }

    private filterSupplementPackages(
        selectedType: string = '',
        setSources: boolean = true,
        filterByFordel: boolean = true,
        filterByDescription: boolean = true,
        fields: any[] = undefined) {
        if (selectedType !== '') {
            selectedType = this.wageType$.getValue().IncomeType;
        }
        this.inntektService.getSalaryValidValue(selectedType)
            .subscribe(response => {
                this.supplementPackages = response;
                if (this.supplementPackages) {
                    if (setSources) {
                        this.setBenefitAndDescriptionSource(selectedType);
                    }
                    if (filterByFordel) {
                        this.setPackagesFilteredByFordel();
                    }
                    if (filterByDescription) {
                        this.setPackagesFilteredByDescription();
                    }

                    if (setSources || filterByDescription) {
                        this.updateUniformFields(fields);
                    }
                }
            }, err => this.errorService.handle(err));
    }

    private setBenefitAndDescriptionSource(selectedType: string) {
        this.benefitDatasource = [];
        this.descriptionDatasource = [];

        this.supplementPackages.forEach(tp => {
            if (!this.benefitDatasource.find(x => x.text === tp.fordel)) {
                this.benefitDatasource.push({ text: tp.fordel });
            }
            let incometypeChild: any = this.getIncometypeChildObject(tp, selectedType);

            if (incometypeChild) {
                if (!this.descriptionDatasource.find(x => x.text === incometypeChild.beskrivelse)) {
                    this.descriptionDatasource.push({ text: incometypeChild.beskrivelse, fordel: tp.fordel });
                }
            }
        });
    }

    private setDescriptionDataSource() {
        let tmp: any[] = [];

        this.descriptionDatasource.forEach(dp => {
            if (dp.fordel === this.wageType$.getValue().Benefit) {
                tmp.push(dp);
            }
        });

        this.descriptionDatasource = tmp;
    }

    private getIncometypeChildObject(tp: any, selType: string = '') {
        let selectedType: string;
        if (selType) {
            selectedType = selType;
        } else {
            selectedType = this.wageType$.getValue().IncomeType;
        }
        let incometypeChild: any;
        if (selectedType) {
            switch (selectedType.toLowerCase()) {
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
        }

        return incometypeChild;
    }

    private updateForSkatteOgAvgiftregel() {
        let filtered: any[] = [];
        this.supplementPackages.forEach(pack => {
            if (pack.skatteOgAvgiftregel === null) {
                filtered.push(pack);
            }
        });

        this.supplementPackages = filtered;
    }

    private setupTilleggsPakker() {
        let selectedType: string = this.wageType$.getValue().IncomeType;
        let packs: any[] = [];

        // Ta bort alle objekter som har 'skatteOgAvgiftsregel' som noe annet enn null
        this.updateForSkatteOgAvgiftregel();

        this.supplementPackages.forEach(tp => {
            let incometypeChild: any = this.getIncometypeChildObject(tp, selectedType);
            if (incometypeChild) {
                let additions: WageTypeSupplement[] = this.addTilleggsInformasjon(incometypeChild);
                if (additions.length > 0) {
                    packs.push({ uninavn: tp.uninavn, additions: additions });
                }
            }
        });
        this.hidePackageDropdown = packs.length > 0 ? false : true;

        if (packs.length > 0) {
            packs.unshift({ uninavn: 'Ingen', additions: [] });
        }

        this.supplementPackages = packs;
    }

    private setPackagesFilteredByFordel() {
        let filtered: any[] = [];

        if (this.wageType$.getValue().Benefit !== '' && this.benefitDatasource.length > 0) {
            this.supplementPackages.forEach(tp => {
                if (tp.fordel === this.wageType$.getValue().Benefit) {
                    filtered.push(tp);
                }
            });
            this.supplementPackages = filtered;
        }
    }

    private setPackagesFilteredByDescription() {
        let filtered: any[] = [];
        if (this.wageType$.getValue().Description !== '' && this.descriptionDatasource.length > 0) {
            this.supplementPackages.forEach(tp => {
                let incometypeChild: any = this.getIncometypeChildObject(tp, this.wageType$.getValue().IncomeType);
                if (incometypeChild) {
                    if (this.wageType$.getValue().Description === incometypeChild.beskrivelse) {
                        filtered.push(tp);
                    }
                }
            });
            this.supplementPackages = filtered;
        }

        this.setupTilleggsPakker();
    }

    private addTilleggsInformasjon(tillegg) {
        let tilleggsObj: any = tillegg.tilleggsinformasjon;
        let spesiObj: any = tillegg.spesifikasjon;
        let additions: WageTypeSupplement[] = [];

        if (tilleggsObj !== null) {
            for (var key in tilleggsObj) {
                if (key !== null) {
                    var obj = tilleggsObj[key];
                    if (typeof obj === 'object' && obj !== null) {
                        for (var prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                if (obj[prop] !== null) {
                                    let wtSupp: WageTypeSupplement = new WageTypeSupplement();
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
                        let wtSupp: WageTypeSupplement = new WageTypeSupplement();
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
            for (var props in spesiObj) {
                if (spesiObj.hasOwnProperty(props)) {
                    if (spesiObj[props] !== null) {
                        let wtSupp: WageTypeSupplement = new WageTypeSupplement();
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
        let selectedPackage: any = this.supplementPackages.find(x => x.uninavn === wageType.SupplementPackage);
        this.showSupplementaryInformations = false;
        if (selectedPackage) {
            let supInfo: Array<any> = [];
            selectedPackage.additions.forEach(addition => {
                supInfo.push(addition);
            });

            if (supInfo && supInfo.length > 0) {
                this.setDeleteOnDuplicates(supInfo, wageType);
            } else {
                wageType.SupplementaryInformations.forEach(supplement => {
                    supplement['_setDelete'] = true;
                });
            }
            if (!!wageType.SupplementaryInformations.length) {
                this.showSupplementaryInformations = true;
                fields.map(field => {
                    if (field.Property === 'SupplementPackage') {
                        field.Hidden = false;
                    }
                });
            }
        }
    }

    private setDeleteOnDuplicates(additions, wageType: WageType): void {
        // filter out not saved supplements
        wageType.SupplementaryInformations = wageType.SupplementaryInformations.filter(x => x.ID);
        // set delete for those supplements thats not in selected addition-package
        if (wageType.SupplementaryInformations && wageType.SupplementaryInformations.length) {
            for (var g = 0; g < wageType.SupplementaryInformations.length; g++) {
                let setDelete = true;
                for (var h = 0; h < additions.length; h++) {
                    if (additions[h].Name === wageType.SupplementaryInformations[g].Name) {
                        setDelete = false;
                    }
                }
                if (setDelete) {
                    wageType.SupplementaryInformations[g].Deleted = true;
                }
            }
        }

        let array = wageType.SupplementaryInformations.concat(JSON.parse(JSON.stringify(additions)));

        // ensure no duplicates
        for (var i = array.length - 1; i > 0; i--) {
            for (var j = i - 1; j >= 0; j--) {
                if (array[i].Name === array[j].Name) {
                    array[j]['_setDelete'] = true;
                    break;
                }
            }
        }
        wageType.SupplementaryInformations = array;
    }

    private setupTilleggspakkeConfig() {
        let tilleggsopplysning = new UniTableColumn('Name', 'Tilleggsopplysning', UniTableColumnType.Text);
        tilleggsopplysning.editable = false;
        let suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text);

        this.tilleggspakkeConfig = new UniTableConfig(true, true, 15)
            .setFilters([{ field: '_setDelete', operator: 'ne', value: 'true', group: 0 }])
            .setColumns([tilleggsopplysning, suggestedValue])
            .setAutoAddNewRow(false);
    }

    public change(changes: SimpleChanges) {
        Observable
            .combineLatest(this.wageType$, this.fields$)
            .take(1)
            .filter((result: [WageType, any[]]) => {
                let [wageType, fields] = result;
                return fields.some(field => {
                    let change = changes[field.Property];
                    return change && change.previousValue !== change.currentValue;
                });
            })
            .map((result: [WageType, any[]]) => {
                let [wageType, fields] = result;

                if (changes['GetRateFrom']) {
                    this.setReadOnlyOnField(
                        fields,
                        'Rate',
                        changes['GetRateFrom'].currentValue !== GetRateFrom.WageType);
                }

                if (changes['Base_Payment']) {
                    let basePayment = changes['Base_Payment'].currentValue;
                    this.setReadOnlyOnField(fields, 'HideFromPaycheck', basePayment);
                    this.setReadOnlyOnField(fields, 'AccountNumber_balance', basePayment);
                    wageType.HideFromPaycheck = false;
                }

                if (changes['SupplementPackage']) {
                    this.showTilleggsPakker(wageType, fields);
                }

                if (changes['_baseOptions']) {
                    this.checkBaseOptions(wageType);
                }

                return [wageType, fields];
            })
            .subscribe((result: [WageType, any[]]) => {
                let [wageType, fields] = result;
                this.fields$.next(fields);
                super.updateState('wagetype', wageType, true);
            });
    }

    private setReadOnlyOnField(fields: any[], prop: string, readOnly: boolean) {
        fields.map(field => {
            if (field.Property === prop) {
                field.ReadOnly = readOnly;
            }
        });
    }

    private checkBaseOptions(wageType: WageType): void {
        wageType.Base_Vacation = this.baseOptions.some(x => x === WageTypeBaseOptions.VacationPay);
        wageType.Base_EmploymentTax = this.baseOptions.some(x => x === WageTypeBaseOptions.AGA);
        wageType.Base_div1 = this.baseOptions.some(x => x === WageTypeBaseOptions.Pension);
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
