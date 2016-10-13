import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WageTypeService, AccountService, InntektService } from '../../../services/services';
import { UniForm, UniFieldLayout } from '../../../../framework/uniForm';
import { WidgetPoster } from '../../../../framework/widgetPoster/widgetPoster';
import { WageType, Account, WageTypeSupplement } from '../../../unientities';
import { IUniSaveAction } from '../../../../framework/save/save';
import { Observable } from 'rxjs/Observable';
import { TabService, UniModules } from '../../layout/navbar/tabstrip/tabService';
import { UniTable, UniTableConfig, UniTableColumnType, UniTableColumn } from 'unitable-ng2/main';
import { IToolbarConfig } from '../../common/toolbar/toolbar';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypeDetails.html'
})
export class WagetypeDetail {
    private aMeldingHelp: string = 'http://veiledning-amelding.smartlearn.no/Veiledn_Generell/index.html#!Documents/lnnsinntekterrapportering.htm';
    private wageType: WageType;
    private wagetypeID: number;
    private accounts: Account[];
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre lønnsart',
            action: this.saveWagetype.bind(this),
            main: true,
            disabled: false
        }
    ];
    private incomeTypeDatasource: any[] = [];
    private benefitDatasource: any[] = [];
    private descriptionDatasource: any[] = [];

    private supplementPackages: any[] = [];

    private tilleggspakkeConfig: UniTableConfig;
    private showSupplementaryInformations: boolean = false;
    private hidePackageDropdown: boolean = true;
    private showBenefitAndDescriptionAsReadonly: boolean = true;

    private currentPackage: string;
    public config: any = {};
    public fields: any[] = [];

    private toolbarConfig: IToolbarConfig;

    @ViewChild(UniForm)
    public uniform: UniForm;

    @ViewChild(UniTable) private supplementTable: UniTable;

    constructor(private route: ActivatedRoute, private router: Router, private wageService: WageTypeService, private tabService: TabService, private accountService: AccountService, private inntektService: InntektService) {

        this.route.params.subscribe(params => {
            this.wagetypeID = +params['id'];

            this.incomeTypeDatasource = [];
            this.benefitDatasource = [];
            this.descriptionDatasource = [];
            this.supplementPackages = [];

            this.setup();
        });
    }

    private setup() {
        Observable.forkJoin(
            this.wageService.getWageType(this.wagetypeID),
            this.wageService.layout('WagetypeDetails'),
            this.accountService.GetAll(null),
            this.inntektService.getSalaryValidValueTypes()
        ).subscribe(
            (response: any) => {
                let [wagetype, layout, accountList, validvaluesTypes] = response;
                this.accounts = accountList;
                this.wageType = wagetype;
                this.fields = layout.Fields;

                this.toolbarConfig = {
                    title: this.wageType.ID ? this.wageType.WageTypeName : 'Ny lønnsart',
                    subheads: [{
                        title: this.wageType.ID ? 'Lønnsartnr. ' + this.wageType.ID : null
                    }],
                    navigation: {
                        prev: this.previousWagetype.bind(this),
                        next: this.nextWagetype.bind(this),
                        add: this.newWagetype.bind(this)
                    }
                }

                if (this.wageType.SupplementaryInformations.length > 0) {
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

                this.setupTypes(validvaluesTypes);

                if (this.wageType.IncomeType !== null) {
                    this.showBenefitAndDescriptionAsReadonly = false;
                    this.filterSupplementPackages();
                }

                this.wageType['_AMeldingHelp'] = this.aMeldingHelp;

                if (this.wageType.ID === 0) {
                    this.wageType.WageTypeNumber = null;
                    this.wageType.AccountNumber = null;
                    this.tabService.addTab({ name: 'Ny lønnsart', url: 'salary/wagetypes/' + this.wagetypeID, moduleID: UniModules.Wagetypes, active: true });
                } else {
                    this.tabService.addTab({ name: 'Lønnsartnr. ' + this.wageType.WageTypeNumber, url: 'salary/wagetypes/' + this.wagetypeID, moduleID: UniModules.Wagetypes, active: true });
                }

                this.updateUniformFields();

                this.config = {
                    submitText: '',
                    sections: {
                        '1': { isOpen: true },
                        '2': { isOpen: true }
                    }
                };

                this.setupTilleggspakkeConfig();

            },
            (err) => {
                this.log('Feil ved henting av lønnsart', err);
            }
            );
    }

    private updateUniformFields() {
        let wageTypeNumber: UniFieldLayout = this.findByProperty(this.fields, 'WageTypeNumber');
        wageTypeNumber.ReadOnly = this.wagetypeID > 0;

        let accountNumber: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber');
        accountNumber.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };

        let accountNumberBalance: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber_balance');
        accountNumberBalance.Options = {
            source: this.accounts,
            valueProperty: 'AccountNumber',
            displayProperty: 'AccountNumber',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.AccountNumber} - ${obj.AccountName}` : ''
        };
        accountNumberBalance.Hidden = !this.wageType.Base_Payment;

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
    }

    public saveWagetype(done) {
        if (this.supplementTable) {
            this.wageType.SupplementaryInformations = this.supplementTable.getTableData();
        }
        if (this.wageType.ID > 0) {
            this.wageService.Put(this.wageType.ID, this.wageType)
                .subscribe((wagetype) => {
                    this.wageType = wagetype;
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                    this.saveactions[0].disabled = false;
                },
                (err) => {
                    this.log('Feil ved oppdatering av lønnsart', err);
                    this.saveactions[0].disabled = false;
                });
        } else {
            this.wageService.Post(this.wageType)
                .subscribe((wagetype) => {
                    this.wageType = wagetype;
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                    this.saveactions[0].disabled = false;
                },
                (err) => {
                    this.log('Feil ved lagring av lønnsart', err);
                    this.saveactions[0].disabled = false;
                });
        }
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    public previousWagetype() {
        this.wageService.getPrevious(this.wageType.ID)
            .subscribe((response) => {
                if (response) {
                    this.wageType = response;
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                }
            });
    }

    public nextWagetype() {
        this.wageService.getNext(this.wageType.ID)
            .subscribe((response) => {
                if (response) {
                    this.wageType = response;
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                }
            });
    }

    private newWagetype() {
        this.wageService.GetNewEntity().subscribe((response) => {
            if (response) {
                this.wageType = response;
                this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
            }
        });
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
