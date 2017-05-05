import {Component, ViewChild, SimpleChanges} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageTypeService, AccountService, InntektService, WageTypeBaseOptions } from '../../../../services/services';
import { UniForm, UniFieldLayout } from 'uniform-ng2/main';
import {
    WageType, Account, WageTypeSupplement, SpecialTaxAndContributionsRule, GetRateFrom,
    StdWageType, SpecialAgaRule, TaxType } from '../../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';

import { UniView } from '../../../../../framework/core/uniView';
import { UniCacheService, ErrorService} from '../../../../services/services';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare const _; // lodash

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
    private baseOptionsCounter: number;

    private tilleggspakkeConfig: UniTableConfig;
    private showSupplementaryInformations: boolean = false;
    private hidePackageDropdown: boolean = true;
    private showBenefitAndDescriptionAsReadonly: boolean = true;
    private wageetypeUsedFieldIsReadOnly: boolean = false;

    private currentPackage: string;
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
            super.getStateSubject('wagetype').subscribe((wageType: WageType) => {
                if (wageType.ID !== this.wagetypeID) {
                    this.wageType$.next(wageType);
                    this.wagetypeID = wageType.ID;
                    this.updateBaseOptions();

                    this.rateIsReadOnly = wageType.GetRateFrom !== GetRateFrom.WageType;

                    this.incomeTypeDatasource = [];
                    this.benefitDatasource = [];
                    this.descriptionDatasource = [];
                    this.supplementPackages = [];

                    this.setup();
                }
            }, err => this.errorService.handle(err));
        });
    }

    private updateBaseOptions() {
        this.baseOptions = [];
        if (this.wageType$.getValue().Base_Vacation) {
            this.baseOptions.push(WageTypeBaseOptions.VacationPay);
        }
        if (this.wageType$.getValue().Base_EmploymentTax) {
            this.baseOptions.push(WageTypeBaseOptions.AGA);
        }
        if (this.wageType$.getValue().Base_div1) {
            this.baseOptions.push(WageTypeBaseOptions.Pension);
        }
        this.baseOptionsCounter = this.baseOptions.length;
        let wageType = this.wageType$.getValue();
        wageType['_baseOptions'] = this.baseOptions;
        this.wageType$.next(wageType);
    }

    private getSetupSources() {
        let sources = [
            this.wageService.layout('WagetypeDetails'),
            this.inntektService.getSalaryValidValueTypes(),
            this.accountService.GetAll(null)
        ];
        if (this.wageType$.getValue().WageTypeNumber) {
            sources.push(this.wageService.usedInPayrollrun(this.wageType$.getValue().WageTypeNumber));
        }
        return sources;
    }

    private setup() {
        const sources = this.getSetupSources();
        Observable.forkJoin(sources).subscribe(
            (response: any) => {
                let [layout, validvaluesTypes, accounts, usedInPayrollrun] = response;
                if (layout.Fields) {
                    this.fields$.next(layout.Fields);
                }
                this.accounts = accounts;
                this.validValuesTypes = validvaluesTypes;
                this.wageetypeUsedFieldIsReadOnly = usedInPayrollrun;

                this.extendFields();
                this.updateUniformFields();
                this.checkAmeldingInfo();
            },
            err => this.errorService.handle(err)
        );
    }

    private extendFields() {
        let rate: UniFieldLayout = this.findByProperty('Rate');
        rate.ReadOnly = this.rateIsReadOnly;

        let baseOptionsField: UniFieldLayout = this.findByProperty('_baseOptions');
        baseOptionsField.ReadOnly = this.wageetypeUsedFieldIsReadOnly;

        let basePaymentField: UniFieldLayout = this.findByProperty('Base_Payment');
        basePaymentField.ReadOnly = this.wageetypeUsedFieldIsReadOnly;

        let wageTypeNumber: UniFieldLayout = this.findByProperty('WageTypeNumber');
        wageTypeNumber.ReadOnly = this.wageType$.getValue().ID > 0;

        let accountNumber: UniFieldLayout = this.findByProperty('AccountNumber');
        accountNumber.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        let accountNumberBalance: UniFieldLayout = this.findByProperty('AccountNumber_balance');
        accountNumberBalance.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };
        accountNumberBalance.ReadOnly = this.wageType$.getValue().Base_Payment;
        this.basePayment = this.wageType$.getValue().Base_Payment;

        let specialAgaRule: UniFieldLayout = this.findByProperty('SpecialAgaRule');
        specialAgaRule.Options = {
            source: this.specialAgaRule,
            displayProperty: 'Name',
            valueProperty: 'ID',
            debounceTime: 500
        };
        specialAgaRule.ReadOnly = this.wageetypeUsedFieldIsReadOnly;

        let taxtype: UniFieldLayout = this.findByProperty('taxtype');
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
        taxtype.ReadOnly = this.wageetypeUsedFieldIsReadOnly;

        let getRateFrom = this.fields$.getValue().find(x => x.Property === 'GetRateFrom');
        getRateFrom.Options = {
            source: this.getRateFrom,
            displayProperty: 'Name',
            valueProperty: 'ID'
        };

        let standardWageTypeFor: UniFieldLayout = this.findByProperty('StandardWageTypeFor');
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
        standardWageTypeFor.ReadOnly = this.wageetypeUsedFieldIsReadOnly;

        let specialTaxAndContributionsRule = this.fields$.getValue().find(x => x.Property === 'SpecialTaxAndContributionsRule');
        specialTaxAndContributionsRule.Options = {
            source: this.specialTaxAndContributionsRule,
            displayProperty: 'Name',
            valueProperty: 'ID',
            debounceTime: 500
        };

        this.fields$.next(this.fields$.getValue());
    }

    private checkAmeldingInfo() {
        if (this.wageType$.getValue().SupplementaryInformations && this.wageType$.getValue().SupplementaryInformations.length > 0) {
            this.showSupplementaryInformations = true;
            this.findByProperty('SupplementPackage').Hidden = false;
        } else {
            this.showSupplementaryInformations = false;
            this.findByProperty('SupplementPackage').Hidden = true;
        }

        if (this.wageType$.getValue().Benefit !== '') {
            this.benefitDatasource.push({ text: this.wageType$.getValue().Benefit });
        }

        if (this.wageType$.getValue().Description !== '') {
            this.descriptionDatasource.push({ text: this.wageType$.getValue().Description });
        }

        this.setupTypes(this.validValuesTypes);

        if (this.wageType$.getValue().IncomeType !== null) {
            this.showBenefitAndDescriptionAsReadonly = false;
            this.filterSupplementPackages();
        }

        this.wageType$.getValue()['_AMeldingHelp'] = this.aMeldingHelp;

        this.updateUniformFields();

        this.setupTilleggspakkeConfig();
    }

    private updateUniformFields() {

        let incomeType: UniFieldLayout = this.findByProperty('IncomeType');
        incomeType.Options = {
            source: this.incomeTypeDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.showSupplementaryInformations = false;
                    this.findByProperty('SupplementPackage').Hidden = true;
                    this.filterSupplementPackages(model.IncomeType, true, false, false);
                    this.showBenefitAndDescriptionAsReadonly = false;
                    this.wageType$.getValue().Description = '';
                    this.wageType$.getValue().Benefit = '';
                    this.uniform.field('Benefit').focus();
                },
                shift_tab: (event) => {
                    this.uniform.field('RateFactor').focus();
                }
            }
        };

        let benefit: UniFieldLayout = this.findByProperty('Benefit');
        benefit.Options = {
            source: this.benefitDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.showSupplementaryInformations = false;
                    this.findByProperty('SupplementPackage').Hidden = true;
                    this.filterSupplementPackages(model.IncomeType, true, true, false);
                    this.setDescriptionDataSource();
                    this.wageType$.getValue().Description = '';
                },
                shift_tab: (event) => {
                    this.uniform.field('IncomeType').focus();
                }
            }
        };
        benefit.ReadOnly = this.showBenefitAndDescriptionAsReadonly;

        let description: UniFieldLayout = this.findByProperty('Description');
        description.Options = {
            source: this.descriptionDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.filterSupplementPackages(model.IncomeType, true, true, true);
                    if (this.supplementPackages.length > 0) {
                        this.findByProperty('SupplementPackage').Hidden = false;
                    }
                    this.uniform.field('SpecialTaxAndContributionsRule').focus();
                },
                shift_tab: (event) => {
                    this.uniform.field('Benefit').focus();
                }
            }
        };
        description.ReadOnly = this.showBenefitAndDescriptionAsReadonly;

        let tilleggsinfo: UniFieldLayout = this.findByProperty('SupplementPackage');
        tilleggsinfo.Options = {
            source: this.supplementPackages,
            valueProperty: 'uninavn',
            displayProperty: 'uninavn',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.uninavn}` : ''
        };
        tilleggsinfo.ReadOnly = this.hidePackageDropdown;

        this.fields$.next(this.fields$.getValue());
    }

    private setupTypes(types: any[]) {
        types.forEach(tp => {
            this.incomeTypeDatasource.push({ text: tp });
        });
    }

    private filterSupplementPackages(selectedType: string = '', setSources: boolean = true, filterByFordel: boolean = true, filterByDescription: boolean = true) {
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

        this.updateUniformFields();
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
        this.updateUniformFields();
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

    private showTilleggsPakker(model: any) {
        let selectedPackage: any = this.supplementPackages.find(x => x.uninavn === model.SupplementPackage);
        this.showSupplementaryInformations = false;
        if (selectedPackage) {
            let supInfo: Array<any> = [];
            selectedPackage.additions.forEach(addition => {
                supInfo.push(addition);
            });

            if (supInfo && supInfo.length > 0) {
                this.wageType$.getValue().SupplementaryInformations = this.setDeleteOnDuplicates(supInfo);
            } else {
                this.wageType$.getValue().SupplementaryInformations.forEach(supplement => {
                    supplement['_setDelete'] = true;
                });
            }

            if (this.wageType$.getValue().SupplementaryInformations.length > 0) {
                this.showSupplementaryInformations = true;
                this.findByProperty('SupplementPackage').Hidden = false;
            }

            super.updateState('wagetype', this.wageType$.getValue(), true);
        }
    }

    private setDeleteOnDuplicates(additions) {
        // set delete for those supplements thats not in selected addition-package
        if (this.wageType$.getValue().SupplementaryInformations && this.wageType$.getValue().SupplementaryInformations.length) {
            for (var g = 0; g < this.wageType$.getValue().SupplementaryInformations.length; g++) {
                let setDelete = true;
                for (var h = 0; h < additions.length; h++) {
                    if (additions[h].Name === this.wageType$.getValue().SupplementaryInformations[g].Name) {
                        setDelete = false;
                    }
                }
                if (setDelete) {
                    this.wageType$.getValue().SupplementaryInformations[g].Deleted = true;
                }
            }
        }

        let array = this.wageType$.getValue().SupplementaryInformations.concat(JSON.parse(JSON.stringify(additions)));

        // ensure no duplicates
        for (var i = array.length - 1; i > 0; i--) {
            for (var j = i - 1; j >= 0; j--) {
                if (array[i].Name === array[j].Name) {
                    array[j]['_setDelete'] = true;
                    break;
                }
            }
        }
        return array;
    }

    private setupTilleggspakkeConfig() {
        let tilleggsopplysning = new UniTableColumn('Name', 'Tilleggsopplysning', UniTableColumnType.Text);
        tilleggsopplysning.editable = false;
        let suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text);

        this.tilleggspakkeConfig = new UniTableConfig(true, true, 15)
            .setColumns([tilleggsopplysning, suggestedValue])
            .setAutoAddNewRow(false);
    }

    public change(changes: SimpleChanges) {
        if (this.currentPackage !== this.wageType$.getValue()['SupplementPackage']) {
            this.currentPackage = this.wageType$.getValue()['SupplementPackage'];
            this.showTilleggsPakker(this.wageType$.getValue());
        }
        let newRateIsReadOnly = this.wageType$.getValue().GetRateFrom !== GetRateFrom.WageType;
        if (this.rateIsReadOnly !== newRateIsReadOnly) {
            this.rateIsReadOnly = newRateIsReadOnly;
            let rate: UniFieldLayout = this.findByProperty('Rate');
            rate.ReadOnly = this.rateIsReadOnly;
        }

        if (this.basePayment !== this.wageType$.getValue().Base_Payment) {
            this.basePayment = this.wageType$.getValue().Base_Payment;
            let accountNumberBalance: UniFieldLayout = this.findByProperty('AccountNumber_balance');
            accountNumberBalance.ReadOnly = this.basePayment;
        }

        this.checkBaseOptions();

        this.wageType$.next(this.wageType$.getValue());

        super.updateState('wagetype', this.wageType$.getValue(), true);
    }

    private checkBaseOptions() {
        if (this.baseOptionsCounter !== this.baseOptions.length) {
            this.baseOptionsCounter = this.baseOptions.length;
            this.wageType$.getValue().Base_Vacation = this.baseOptions.some(x => x === WageTypeBaseOptions.VacationPay);
            this.wageType$.getValue().Base_EmploymentTax = this.baseOptions.some(x => x === WageTypeBaseOptions.AGA);
            this.wageType$.getValue().Base_div1 = this.baseOptions.some(x => x === WageTypeBaseOptions.Pension);
        }
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

    private findByProperty(name) {
        return this.fields$.getValue().find((fld) => fld.Property === name);
    }

    public log(title: string, err) {
        if (!title) {
            title = '';
        }
        if (err._body) {
            alert(title + ' ' + err._body);
        } else {
            alert(title + ' ' + JSON.stringify(err));
        }

    }
}
