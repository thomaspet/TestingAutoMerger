import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageTypeService, AccountService, InntektService } from '../../../../services/services';
import { UniForm, UniFieldLayout } from '../../../../../framework/uniForm';
import { WageType, Account, WageTypeSupplement } from '../../../../unientities';
import { Observable } from 'rxjs/Observable';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';

import { UniView } from '../../../../../framework/core/uniView';
import { UniCacheService } from '../../../../services/services';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/views/wagetypeDetails.html'
})
export class WagetypeDetail extends UniView {
    private aMeldingHelp: string = 'http://veiledning-amelding.smartlearn.no/Veiledn_Generell/index.html#!Documents/lnnsinntekterrapportering.htm';
    private wageType: WageType;
    private wagetypeID: number;
    private accounts: Account[];
    private incomeTypeDatasource: any[] = [];
    private benefitDatasource: any[] = [];
    private descriptionDatasource: any[] = [];
    private validValuesTypes: any[] = [];

    private supplementPackages: any[] = [];

    private tilleggspakkeConfig: UniTableConfig;
    private showSupplementaryInformations: boolean = false;
    private hidePackageDropdown: boolean = true;
    private showBenefitAndDescriptionAsReadonly: boolean = true;

    private currentPackage: string;
    public config: any = {};
    public fields: any[] = [];

    @ViewChild(UniForm)
    public uniform: UniForm;

    @ViewChild(UniTable) private supplementTable: UniTable;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private wageService: WageTypeService,
        private accountService: AccountService,
        private inntektService: InntektService,
        public cacheService: UniCacheService) {

        super(router.url, cacheService);

        this.route.parent.params.subscribe(params => {
            super.updateCacheKey(router.url);
            super.getStateSubject('wagetype').subscribe((wageType: WageType) => {
                this.wageType = _.cloneDeep(wageType);

                this.incomeTypeDatasource = [];
                this.benefitDatasource = [];
                this.descriptionDatasource = [];
                this.supplementPackages = [];

                if (!this.wagetypeID) {
                    this.wagetypeID = wageType.ID;
                    this.setup();
                } else {
                    this.checkAmeldingInfo();
                }
            });
        });
    }

    private setup() {
        Observable.forkJoin(
            this.wageService.layout('WagetypeDetails'),
            this.inntektService.getSalaryValidValueTypes(),
            this.accountService.GetAll(null)
        ).subscribe(
            (response: any) => {
                let [layout, validvaluesTypes, accounts] = response;
                this.fields = layout.Fields;
                this.accounts = accounts;
                this.validValuesTypes = validvaluesTypes;
                this.checkAmeldingInfo();

                this.config = {
                    submitText: '',
                    sections: {
                        '1': { isOpen: true },
                        '2': { isOpen: true }
                    }
                };
                
            },
            (err) => {
                this.log('Feil ved henting av lønnsart', err);
            }
            );
    }

    private checkAmeldingInfo() {
        if (this.wageType.SupplementaryInformations && this.wageType.SupplementaryInformations.length > 0) {
            this.showSupplementaryInformations = true;
        } else {
            this.showSupplementaryInformations = false;
        }

        if (this.wageType.Benefit !== '') {
            this.benefitDatasource.push({ text: this.wageType.Benefit });
        }

        if (this.wageType.Description !== '') {
            this.descriptionDatasource.push({ text: this.wageType.Description });
        }

        this.setupTypes(this.validValuesTypes);

        if (this.wageType.IncomeType !== null) {
            this.showBenefitAndDescriptionAsReadonly = false;
            this.filterSupplementPackages();
        }

        this.wageType['_AMeldingHelp'] = this.aMeldingHelp;

        if (this.wageType.ID === 0) {
            this.wageType.WageTypeNumber = null;
            this.wageType.AccountNumber = null;
        }

        this.updateUniformFields();

        this.setupTilleggspakkeConfig();
    }

    private updateUniformFields() {
        let wageTypeNumber: UniFieldLayout = this.findByProperty(this.fields, 'WageTypeNumber');
        wageTypeNumber.ReadOnly = this.wagetypeID > 0;

        let accountNumber: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber');
        accountNumber.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };

        let accountNumberBalance: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber_balance');
        accountNumberBalance.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            template: (account: Account) => account ? `${account.AccountNumber} - ${account.AccountName}` : '',
        };
        accountNumberBalance.ReadOnly = this.wageType.Base_Payment;

        let incomeType: UniFieldLayout = this.findByProperty(this.fields, 'IncomeType');
        incomeType.Options = {
            source: this.incomeTypeDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.wageType.Benefit = '';
                    this.wageType.Description = '';
                    this.showSupplementaryInformations = false;
                    this.findByProperty(this.fields, '_uninavn').Hidden = true;
                    this.filterSupplementPackages(model.IncomeType, true, false, false);
                    this.showBenefitAndDescriptionAsReadonly = false;
                    this.uniform.field('Benefit').focus();
                }
            }
        };

        let benefit: UniFieldLayout = this.findByProperty(this.fields, 'Benefit');
        benefit.Options = {
            source: this.benefitDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.showSupplementaryInformations = false;
                    this.findByProperty(this.fields, '_uninavn').Hidden = true;
                    this.filterSupplementPackages('', false, true, false);
                    this.setDescriptionDataSource();
                    this.uniform.field('Description').focus();
                }
            }
        };
        benefit.ReadOnly = this.showBenefitAndDescriptionAsReadonly;

        let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
        description.Options = {
            source: this.descriptionDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.filterSupplementPackages('', false, true, true);
                    this.findByProperty(this.fields, '_uninavn').Hidden = false;
                }
            }
        };
        description.ReadOnly = this.showBenefitAndDescriptionAsReadonly;

        let tilleggsinfo: UniFieldLayout = this.findByProperty(this.fields, '_uninavn');
        tilleggsinfo.Options = {
            source: this.supplementPackages,
            valueProperty: 'uninavn',
            displayProperty: 'uninavn',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.uninavn}` : ''
        };
        tilleggsinfo.ReadOnly = this.hidePackageDropdown;

        this.fields = _.cloneDeep(this.fields);
    }

    private setupTypes(types: any[]) {
        types.forEach(tp => {
            this.incomeTypeDatasource.push({ text: tp });
        });
    }

    private filterSupplementPackages(selectedType: string = '', setSources: boolean = true, filterByFordel: boolean = true, filterByDescription: boolean = true) {
        if (selectedType !== '') {
            selectedType = this.wageType.IncomeType;
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
            });
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
            if (dp.fordel === this.wageType.Benefit) {
                tmp.push(dp);
            }
        });

        this.descriptionDatasource = tmp;
        this.updateUniformFields();
    }

    private getIncometypeChildObject(tp: any, selType: string = '') {
        let selectedType: string;
        if (selType) {
            selectedType = selType;
        } else {
            selectedType = this.wageType.IncomeType;
        }
        let incometypeChild: any;

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
        let selectedType: string = this.wageType.IncomeType;
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
        this.supplementPackages = packs;
        this.updateUniformFields();
    }

    private setPackagesFilteredByFordel() {
        let filtered: any[] = [];

        if (this.wageType.Benefit !== '' && this.benefitDatasource.length > 0) {
            this.supplementPackages.forEach(tp => {
                if (tp.fordel === this.wageType.Benefit) {
                    filtered.push(tp);
                }
            });
            this.supplementPackages = filtered;
        }
    }

    private setPackagesFilteredByDescription() {
        let filtered: any[] = [];

        if (this.wageType.Description !== '' && this.descriptionDatasource.length > 0) {
            this.supplementPackages.forEach(tp => {
                let incometypeChild: any = this.getIncometypeChildObject(tp, this.wageType.IncomeType);
                if (incometypeChild) {
                    if (this.wageType.Description === incometypeChild.beskrivelse) {
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
                                let wtSupp: WageTypeSupplement = new WageTypeSupplement();
                                wtSupp.Name = prop;
                                wtSupp.SuggestedValue = obj[prop];
                                wtSupp.WageTypeID = this.wagetypeID;
                                wtSupp['_createguid'] = this.wageService.getNewGuid();
                                additions.push(wtSupp);
                            }
                        }
                    } else if (obj !== null) {
                        let wtSupp: WageTypeSupplement = new WageTypeSupplement();
                        wtSupp.Name = key;
                        wtSupp.SuggestedValue = obj;
                        wtSupp.WageTypeID = this.wagetypeID;
                        wtSupp['_createguid'] = this.wageService.getNewGuid();
                        additions.push(wtSupp);
                    }
                }
            }
        }

        if (spesiObj !== null) {
            for (var props in spesiObj) {
                if (spesiObj.hasOwnProperty(props)) {
                    let wtSupp: WageTypeSupplement = new WageTypeSupplement();
                    wtSupp.Name = props;
                    wtSupp.SuggestedValue = spesiObj[props];
                    wtSupp.WageTypeID = this.wagetypeID;
                    wtSupp['_createguid'] = this.wageService.getNewGuid();
                    additions.push(wtSupp);
                }
            }
        }

        return additions;
    }

    private showTilleggsPakker(model: any) {
        let selectedPackage: any = this.supplementPackages.find(x => x.uninavn === model._uninavn);
        this.showSupplementaryInformations = false;

        let supInfo: Array<any> = [];
        selectedPackage.additions.forEach(addition => {
            supInfo.push(addition);
        });

        this.wageType.SupplementaryInformations = JSON.parse(JSON.stringify(supInfo));

        if (this.wageType.SupplementaryInformations.length > 0) {
            this.showSupplementaryInformations = true;
        }
    }

    private setupTilleggspakkeConfig() {
        let tilleggsopplysning = new UniTableColumn('Name', 'Tilleggsopplysning', UniTableColumnType.Text);
        tilleggsopplysning.editable = false;
        let suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text);

        this.tilleggspakkeConfig = new UniTableConfig(true, true, 15)
            .setColumns([tilleggsopplysning, suggestedValue])
            .setAutoAddNewRow(false);
    }

    public change(model) {
        this.updateUniformFields();
        if (this.currentPackage !== this.wageType['_uninavn']) {
            this.currentPackage = this.wageType['_uninavn'];
            this.showTilleggsPakker(model);
        }

        if (this.supplementTable) {
            this.wageType.SupplementaryInformations = this.supplementTable.getTableData();
        } else {
            this.wageType.SupplementaryInformations = null;
        }

        super.updateState('wagetype', model, true);
    }
    public toggle(section) {
        if (section.sectionId === 2) {
            if (section.isOpen) {
                if (this.wageType.SupplementaryInformations.length > 0) {
                    this.showSupplementaryInformations = true;
                }
            } else {
                this.showSupplementaryInformations = false;
            }
        }
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
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
