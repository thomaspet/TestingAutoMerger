import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WageTypeService, AccountService, InntektService} from '../../../services/services';
import {UniForm, UniFieldLayout} from '../../../../framework/uniForm';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {WageType, Account, Inntekt} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypeDetails.html',
    providers: [WageTypeService, AccountService, InntektService],
    directives: [UniForm, UniSave, WidgetPoster, UniTable]
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
    private packagesForSelectedTypeFiltered: any[] = [];
    private packagesForSelectedType: any[] = [];
    private packages: any[] = [];
    private tilleggsinformasjonDatasource: any[] = [];

    private tilleggspakkeConfig: UniTableConfig;

    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    constructor(private route: ActivatedRoute, private router: Router, private wageService: WageTypeService, private tabService: TabService, private accountService: AccountService, private inntektService: InntektService) {

        this.config = {
            submitText: ''
        };
        this.route.params.subscribe(params => {
            this.wagetypeID = +params['id'];
            this.getLayoutAndData();
        });
    }

    private getLayoutAndData() {
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
                this.setupTypes(validvaluesTypes);
                console.log('lønnsart', this.wageType);
                this.wageType['_AMeldingHelp'] = this.aMeldingHelp;

                // console.log('benefit datasource', this.benefitDatasource);
                // console.log('typer', this.incomeTypeDatasource);
                
                if (this.wageType.ID === 0) {
                    this.wageType.WageTypeNumber = null;
                    this.wageType.AccountNumber = null;
                    this.tabService.addTab({ name: 'Ny lønnsart', url: 'salary/wagetypes/' + this.wagetypeID, moduleID: 13, active: true });
                } else {
                    this.tabService.addTab({ name: 'Lønnsartnr. ' + this.wageType.WageTypeNumber, url: 'salary/wagetypes/' + this.wagetypeID, moduleID: 13, active: true });
                }

                this.fields = layout.Fields;

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

                let incomeType: UniFieldLayout = this.findByProperty(this.fields, 'IncomeType');
                incomeType.Options = {
                    source: this.incomeTypeDatasource,
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : '',
                    events: {
                        select: (model) => {
                            console.log('valgt type (model)', model);
                            this.setupIncomeType(model.IncomeType);
                        }
                        // ,
                        // enter: (model) => {
                        //     console.log(self.wageType.IncomeType);
                        //     console.log('valgt type', model);
                        //     this.setupIncomeType(model.IncomeType);
                        // }
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
                            this.setupDescriptionDataSourceFiltered();
                            this.setupFilteredTilleggsPakker('fordel');
                        }
                    }
                };

                let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
                description.Options = {
                    source: this.descriptionDatasource,
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : '',
                    events: {
                        select: (model) => {
                            this.setupFilteredTilleggsPakker('beskrivelse');
                        }
                    }
                };

                let tilleggsinfo: UniFieldLayout = this.findByProperty(this.fields, '_OldLTCode');
                tilleggsinfo.Options = {
                    source: this.packages,
                    valueProperty: 'gmlcode',
                    displayProperty: 'gmlcode',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.gmlcode}` : '',
                    events: {
                        select: (model) => {
                            this.showTilleggsPakker(model);
                        }
                    }
                };

                this.fields = _.cloneDeep(this.fields);

                this.config = {
                    submitText: ''
                };
                this.toggleAccountNumberBalanceHidden();

                this.setupTilleggspakkeConfig();

            },
            (err) => {
                this.log('Feil ved henting av lønnsart', err);
            }
            );
    }

    private setupTypes(types: any[]) {
        types.forEach(tp => {
            this.incomeTypeDatasource.push({text: tp});
        });
    }

    private setupIncomeType(selectedType: string) {
        if (!selectedType) {
            selectedType = this.wageType.IncomeType;
        }
        this.inntektService.getSalaryValidValue(selectedType)
        .subscribe(response => {
            this.packagesForSelectedType = this.packagesForSelectedTypeFiltered = response;
            if (this.packagesForSelectedType) {
                this.setupFordelAndDescription(selectedType);
            }
        });
    }

    private setupFordelAndDescription(selectedType: string) {
        this.benefitDatasource = [];
        this.descriptionDatasource = [];

        this.packagesForSelectedType.forEach(tp => {
            if (!this.benefitDatasource.find(x => x.text === tp.fordel)) {
                this.benefitDatasource.push({text: tp.fordel});
            }
            let incometypeChild: any = this.getIncometypeChildObject(tp, selectedType);
            
            if (incometypeChild) {
                if (!this.descriptionDatasource.find(x => x.text === incometypeChild.beskrivelse)) {
                    this.descriptionDatasource.push({text: incometypeChild.beskrivelse, fordel: tp.fordel});
                }
            }
        });

        this.updateFieldBenefitAndDescription();
    }

    private setupDescriptionDataSourceFiltered() {
        let selectedFordel: string = this.wageType.Benefit;
        let tmp: any[] = [];
        this.descriptionDatasource.forEach(dp => {
            if (dp.fordel === selectedFordel) {
                tmp.push(dp);
            }
        });
        this.descriptionDatasource = tmp;
        this.updateFieldBenefitAndDescription();
    }

    private getIncometypeChildObject(tp: any, selType: string = '') {
        let selectedType: string;
        if (selType) {
            selectedType = selType;
        } else {
            selectedType  = this.wageType.IncomeType; 
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

    private setupTilleggsPakker() {
        let selectedType: string = this.wageType.IncomeType;

        this.packages = [];
        this.tilleggsinformasjonDatasource = [];

        this.packagesForSelectedTypeFiltered.forEach(tp => {
            let incometypeChild: any = this.getIncometypeChildObject(tp, selectedType);
            
            if (incometypeChild) {
                let additions: any[] = this.addTilleggsInformasjon(incometypeChild);
                if (additions.length > 0) {
                    this.packages.push({gmlcode: tp.gmlcode, additions: additions});
                }
            }
        });

        this.updateFieldOldLTCode();
    }

    private setupFilteredTilleggsPakker(fromCombo: string) {
        let filtered: any[] = [];
        let selectedType: string = this.wageType.IncomeType;
        let selectedFordel: string = this.wageType.Benefit;
        let selectedDescription: string = this.wageType.Description;

        console.log('fromCombo', fromCombo);
        console.log('antall pakker FØR filtrering', this.packagesForSelectedTypeFiltered.length);
        switch (fromCombo) {
            case 'fordel':
                if (selectedFordel !== '' && this.benefitDatasource.length > 0) {
                    this.packagesForSelectedTypeFiltered.forEach(tp => {
                        if (tp.fordel === selectedFordel) {
                            filtered.push(tp);
                        }
                    });
                }
                this.packagesForSelectedTypeFiltered = filtered;
                console.log('antall pakker ETTER filtrering', this.packagesForSelectedTypeFiltered.length);
                break;
            case 'beskrivelse':
                console.log('filtered', this.packagesForSelectedTypeFiltered);

                this.packagesForSelectedTypeFiltered.forEach(tp => {
                    if (this.wageType.Description !== '' && this.descriptionDatasource.length > 0) {
                        let incometypeChild: any = this.getIncometypeChildObject(tp, selectedType);
                        if (incometypeChild) {
                            if (selectedDescription === incometypeChild.beskrivelse) {
                                filtered.push(tp);
                            }
                        }
                    }
                });
                this.packagesForSelectedTypeFiltered = filtered;
                console.log('antall pakker ETTER filtrering', this.packagesForSelectedTypeFiltered.length);
                this.setupTilleggsPakker();
                break;

            default:
                break;
        }
        
        
    }

    private addTilleggsInformasjon(tillegg) {
        let tilleggsObj: any = tillegg.tilleggsinformasjon;
        let spesiObj: any = tillegg.spesifikasjon;
        let additions: any[] = [];
        console.log('tillegg', tillegg);
        if (tilleggsObj !== null) {
            for (var key in tilleggsObj) {
                if (key !== null) {
                    console.log('heile objektet', tilleggsObj);
                    console.log('key', key);
                    var obj = tilleggsObj[key];
                    if (typeof obj === 'object') {
                        console.log('obj', obj);
                        for (var prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                console.log('tillegg prop', prop);
                                console.log('tillegg prop value', obj[prop]);
                                additions.push({Name: prop, SuggestedValue: obj[prop]});
                            }
                        }
                    } else {
                        if (key !== null) {
                            for (var prp in tilleggsObj) {
                                if (tilleggsObj.hasOwnProperty(prp)) {
                                    console.log('tillegg prop', prp);
                                    console.log('tillegg prop value', tilleggsObj[prp]);
                                    additions.push({Name: prop, SuggestedValue: tilleggsObj[prp]});
                                }
                            }
                        }
                    }
                }
            }
        }

        if (spesiObj !== null) {
            for (var props in spesiObj) {
                if (spesiObj.hasOwnProperty(props)) {
                    console.log('props', props);
                    console.log('props value', spesiObj[props]);
                    additions.push({Name: props, SuggestedValue: spesiObj[props]});
                }
            }
        }

        return additions;
    }

    private updateFieldBenefitAndDescription() {
        let benefit: UniFieldLayout = this.findByProperty(this.fields, 'Benefit');
        benefit.Options = {
            source: this.benefitDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.setupDescriptionDataSourceFiltered();
                    this.setupFilteredTilleggsPakker('fordel');
                }
                // ,
                // enter: (model) => {
                //     this.setupFilteredTilleggsPakker('fordel');
                // }
            }
        };

        let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
        description.Options = {
            source: this.descriptionDatasource,
            valueProperty: 'text',
            displayProperty: 'text',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.text}` : '',
            events: {
                select: (model) => {
                    this.setupFilteredTilleggsPakker('beskrivelse');
                }
                // ,
                // enter: (model) => {
                //     this.setupFilteredTilleggsPakker('beskrivelse');
                // }
            }
        };

        this.fields = _.cloneDeep(this.fields);
    }

    private updateFieldOldLTCode() {
        let tilleggsinfo: UniFieldLayout = this.findByProperty(this.fields, '_OldLTCode');
        tilleggsinfo.Options = {
            source: this.packages,
            valueProperty: 'gmlcode',
            displayProperty: 'gmlcode',
            debounceTime: 200,
            template: (obj) => obj ? `${obj.gmlcode}` : '',
            events: {
                select: (model) => {
                    this.showTilleggsPakker(model);
                }
                // ,
                // enter: (model) => {
                //     this.showTilleggsPakker(model);
                // }
            }
        };

        this.fields = _.cloneDeep(this.fields);
    }

    private showTilleggsPakker(model: any) {
        console.log('Valgt pakke som skal vises', model);
        let selectedPackage: any = this.packages.find(x => x.gmlcode === model._OldLTCode);
        console.log('selected package', selectedPackage);

        this.tilleggsinformasjonDatasource = [];
        selectedPackage.additions.forEach(addition => {
            this.tilleggsinformasjonDatasource.push(addition);
        });
    }

    private toggleAccountNumberBalanceHidden() {
        let accountNumberBalance: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber_balance');
        if (accountNumberBalance.Hidden !== this.wageType.Base_Payment) {
            accountNumberBalance.Hidden = this.wageType.Base_Payment;
            this.fields = _.cloneDeep(this.fields);
        }
        // setTimeout(() => {
        //     if (!this.uniform.section(1).isOpen) {
        //         this.uniform.section(1).toggle();
        //     }
        //     if (!this.uniform.section(2).isOpen) {
        //         this.uniform.section(2).toggle();
        //     }
        // }, 100);
    }

    private setupTilleggspakkeConfig() {
        let tilleggsopplysning = new UniTableColumn('Name', 'Tilleggsopplysning', UniTableColumnType.Text);
        let suggestedValue = new UniTableColumn('SuggestedValue', 'Fast verdi', UniTableColumnType.Text);

        this.tilleggspakkeConfig = new UniTableConfig(true)
        .setColumns([tilleggsopplysning, suggestedValue]);
    }

    public change(value) {
        this.toggleAccountNumberBalanceHidden();
    }

    public saveWagetype(done) {
        this.saveactions[0].disabled = true;
        done('Lagrer lønnsart');
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
                    console.log(err);
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
