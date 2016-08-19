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

                console.log('benefit datasource', this.benefitDatasource);
                console.log('typer', this.incomeTypeDatasource);
                
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

                let self = this;
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
                            this.setupFordelAndDescription(model.IncomeType);
                        },
                        enter: (model) => {
                            console.log(self.wageType.IncomeType);
                            console.log('valgt type', model);
                            this.setupFordelAndDescription(model.IncomeType);
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
                    // events: {
                    //     select: (model) => {
                    //         this.updateTypeAndDescriptionDatasource();
                    //     },
                    //     enter: (model) => {
                    //         this.updateTypeAndDescriptionDatasource();
                    //     }
                    // }
                };

                let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
                description.Options = {
                    source: this.descriptionDatasource,
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : '',
                    // events: {
                    //     select: (model) => {
                    //         this.updateTypeAndBenefitDatasource();
                    //     },
                    //     enter: (model) => {
                    //         this.updateTypeAndBenefitDatasource();
                    //     }
                    // }
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
        console.log('incometypes', this.incomeTypeDatasource);
    }

    private setupFordelAndDescription(selectedType: string) {
        let types: any[] = [];
        console.log('selectedType', selectedType);
        console.log('wagetype', this.wageType);
        if (!selectedType) {
            selectedType = this.wageType.IncomeType;
            // selectedType = this.incomeTypeDatasource[2].text;
        }
        console.log('selectedType', selectedType);
        this.inntektService.getSalaryValidValue(selectedType)
        .subscribe(response => {
            types = response;
            if (types) {
                
                this.benefitDatasource = [];
                this.descriptionDatasource = [];
                this.tilleggsinformasjonDatasource = [];

                types.forEach(tp => {
                    if (!this.benefitDatasource.find(x => x.text === tp.fordel)) {
                        this.benefitDatasource.push({text: tp.fordel});
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
                    if (incometypeChild) {
                        if (!this.descriptionDatasource.find(x => x.text === incometypeChild.beskrivelse)) {
                            this.descriptionDatasource.push({text: incometypeChild.beskrivelse});
                        }

                        this.addTilleggsInformasjon(incometypeChild);
                    }
                });
                console.log('Fordel', this.benefitDatasource);
                console.log('Beskrivelse', this.descriptionDatasource);
                console.log('Tilleggsopplysninger', this.tilleggsinformasjonDatasource);

                this.updateFields();
            }
        });
    }

    private updateFields() {
        let benefit: UniFieldLayout = this.findByProperty(this.fields, 'Benefit');
        benefit.Options = {
            source: this.benefitDatasource,
            valueProperty: 'text',
            displayProperty: 'text'
        };
        
        let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
        description.Options = {
            source: this.descriptionDatasource,
            valueProperty: 'text',
            displayProperty: 'text'
        };

        let tilleggsinfo: UniFieldLayout = this.findByProperty(this.fields, 'WageTypeSupplement.Name');
        tilleggsinfo.Options = {
            source: this.tilleggsinformasjonDatasource,
            template: (obj) => obj ? `${obj.Name}: ${obj.SuggestedValue}` : '',
        };

        this.fields = _.cloneDeep(this.fields);
    }

    private addTilleggsInformasjon(tillegg) {
        let tilleggsinfo: {} = tillegg.tilleggsinformasjon;
        if (tilleggsinfo !== null) {
            for (var key in tilleggsinfo) {
                if (key) {
                    var obj = tilleggsinfo[key];
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            if (!this.tilleggsinformasjonDatasource.find(x => x.Name === prop)) {
                                this.tilleggsinformasjonDatasource.push({Name: prop, SuggestedValue: obj[prop]});
                            }
                        }
                    }
                }
            }
        }
    }

    private toggleAccountNumberBalanceHidden() {
        let accountNumberBalance: UniFieldLayout = this.findByProperty(this.fields, 'AccountNumber_balance');
        if (accountNumberBalance.Hidden !== this.wageType.Base_Payment) {
            accountNumberBalance.Hidden = this.wageType.Base_Payment;
            this.fields = _.cloneDeep(this.fields);
        }
        setTimeout(() => {
            if (!this.uniform.section(1).isOpen) {
                this.uniform.section(1).toggle();
            }
            if (!this.uniform.section(2).isOpen) {
                this.uniform.section(2).toggle();
            }
        }, 100);
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
