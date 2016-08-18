import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WageTypeService, AccountService, InntektService} from '../../../services/services';
import {UniForm, UniFieldLayout} from '../../../../framework/uniForm';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {WageType, Account, Inntekt} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypeDetails.html',
    providers: [WageTypeService, AccountService, InntektService],
    directives: [UniForm, UniSave, WidgetPoster]
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
    // private typeBenefitDescriptionCombinations: any[] = [
    //     // {incometype: '1', benefit: '1', description: '1'},
    //     // {incometype: '2', benefit: '1', description: '2'},
    //     // {incometype: '3', benefit: '1', description: '3'},
    //     // {incometype: '4', benefit: '1', description: '1'},
    //     // {incometype: '5', benefit: '1', description: '2'},
    //     // {incometype: '1', benefit: '2', description: '3'},
    //     // {incometype: '2', benefit: '2', description: '1'},
    //     // {incometype: '3', benefit: '2', description: '2'},
    //     // {incometype: '4', benefit: '2', description: '3'},
    //     // {incometype: '5', benefit: '2', description: '1'},
    //     // {incometype: '1', benefit: '3', description: '2'},
    //     // {incometype: '2', benefit: '3', description: '3'},
    //     // {incometype: '3', benefit: '3', description: '1'},
    //     // {incometype: '4', benefit: '3', description: '2'},
    //     // {incometype: '5', benefit: '3', description: '3'},
    // ];
    // {text: 'Lønn'}, {text: 'YtelseFraOffentlige'}, {text: 'PensjonEllerTrygd'}, {text: 'NæringsInntekt'}, {text: 'Fradrag'}
    private incomeTypeDatasource: any[] = [];
    private benefitDatasource: any[] = [];
    private descriptionDatasource: any[] = [];

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
            // this.inntektService.getSalaryValidValue(),
            this.inntektService.getSalaryValidValueTypes()
        ).subscribe(
            (response: any) => {
                let [wagetype, layout, accountList, validvaluesTypes] = response;
                this.accounts = accountList;
                this.wageType = wagetype;
                // this.typeBenefitDescriptionCombinations = validvalues;
                this.setupTypes(validvaluesTypes);
                // this.incomeTypeDatasource = this.benefitDatasource = validvaluesTypes;

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

                let incomeType: UniFieldLayout = this.findByProperty(this.fields, 'IncomeType');
                incomeType.Options = {
                    source: this.incomeTypeDatasource, // [ {text: 'Lønn'}, {text: 'YtelseFraOffentlige'}, {text: 'PensjonEllerTrygd'}, {text: 'Næringsinntekt'}, {text: 'Fradrag'}, {text: 'Forskuddtrekk'}],
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : '',
                    events: {
                        select: (model) => {
                            console.log('valgt type (model)', model);
                            this.setupFordelAndDescription(model.text);
                        },
                        enter: (model) => {
                            console.log('valgt type', model);
                            this.setupFordelAndDescription(model.text);
                        }
                    }
                };

                let benefit: UniFieldLayout = this.findByProperty(this.fields, 'Benefit');
                benefit.Options = {
                    source: this.benefitDatasource, // [ {text: 'Kontantytelse'}, {text: 'Naturalytelse'}, {text: 'Utgiftgodtgjoerelse'}],
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
                    source: this.descriptionDatasource, // [ {text: 'Fastlønn'} ],
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
            selectedType = this.incomeTypeDatasource[3].text;
        }
        this.inntektService.getSalaryValidValue(selectedType)
        .subscribe(response => {
            types = response;
            if (types) {
                
                this.benefitDatasource = [];
                this.descriptionDatasource = [];
                this.benefitDatasource.push({text: ''});
                this.descriptionDatasource.push({text: ''});

                types.forEach(tp => {
                    if (!this.benefitDatasource.find(x => x.text === tp.fordel)) {
                        this.benefitDatasource.push({text: tp.fordel});
                    }
                    if (tp.beskrivelse) {
                        if (!this.descriptionDatasource.find(x => x.text === tp.beskrivelse)) {
                            this.descriptionDatasource.push({text: tp.beskrivelse});
                        }
                    }
                });
                console.log('Fordel', this.benefitDatasource);
                console.log('Beskrivelse', this.descriptionDatasource);

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

                this.fields = _.cloneDeep(this.fields);
            }
        });
    }

    // private updateBenefitAndDescriptionDatasource() {
    //     console.log('oppdater datakilder - fra type');
        
    //     let incomeTypeField = this.findByProperty(this.fields, 'IncomeType');
    //     console.log('incomeType ved findproperty', incomeTypeField);
    //     console.log('incometype ved wageType object', this.wageType);

    //     let combinations: any[] = this.typeBenefitDescriptionCombinations.filter(x => x.incometype === 'Lønn'); // this.wageType.IncomeType);
    //     console.log('combinations', combinations);
        
    //     this.benefitDatasource = [];
    //     this.descriptionDatasource = [];

    //     combinations.forEach(combination => {
    //         console.log('combination', combination);
    //         this.benefitDatasource.push(combination.benefit);
    //         this.descriptionDatasource.push(combination.description);
    //     });
    // }

    // private updateTypeAndDescriptionDatasource() {
    //     console.log('oppdater datakilder - fra fordel');

    //     let benefitField = this.findByProperty(this.fields, 'Benefit');
    //     console.log('benefit ved findproperty', benefitField);
    //     console.log('benefit ved wageType object', this.wageType);

    //     let combinations: any[] = this.typeBenefitDescriptionCombinations.filter(x => x.benefit === '1'); // this.wageType.Benefit);
    //     console.log('combinations', combinations);
        
    //     this.incomeTypeDatasource = [];
    //     this.descriptionDatasource = [];
        
    //     combinations.forEach(combination => {
    //         console.log('combination', combination);
    //         this.incomeTypeDatasource.push(combination.incometype);
    //         this.descriptionDatasource.push(combination.description);
    //     });
    // }

    // private updateTypeAndBenefitDatasource() {
    //     console.log('oppdater datakilder - fra beskrivelse');

    //     let descriptionField = this.findByProperty(this.fields, 'Description');
    //     console.log('description ved findproperty', descriptionField);
    //     console.log('description ved wageType object', this.wageType);
    //     console.log('typeBenefitDescriptionCombinations', this.typeBenefitDescriptionCombinations);

    //     let combinations: any[] = this.typeBenefitDescriptionCombinations.filter(x => x.description === '1'); // this.wageType.Description);
    //     console.log('combinations', combinations);
    //     console.log('incometypedatasource', this.incomeTypeDatasource);
        
    //     this.incomeTypeDatasource = [];
    //     this.benefitDatasource = [];

    //     console.log('incometypedatasource bør være blank', this.incomeTypeDatasource);
        
    //     combinations.forEach(combination => {
    //         console.log('combination', combination);
    //         this.incomeTypeDatasource.push(combination.incometype);
    //         this.benefitDatasource.push(combination.benefit);
    //     });

    //     console.log('incometypedatasource bør ha fått nye verdier', this.incomeTypeDatasource);
    // }

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
