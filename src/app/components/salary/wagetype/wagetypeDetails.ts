import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WageTypeService, AccountService} from '../../../services/services';
import {UniForm, UniFieldLayout} from '../../../../framework/uniForm';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {WageType, Account} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypeDetails.html',
    providers: [WageTypeService, AccountService],
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
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    constructor(private route: ActivatedRoute, private router: Router, private wageService: WageTypeService, private tabService: TabService, private accountService: AccountService) {

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
            this.accountService.GetAll(null)
        ).subscribe(
            (response: any) => {
                let [wagetype, layout, accountList] = response;
                this.accounts = accountList;
                this.wageType = wagetype;

                if (this.wageType.ID === 0) {
                    this.wageType.WageTypeId = null;
                    this.wageType.AccountNumber = null;
                    this.tabService.addTab({ name: 'Ny lønnsart', url: 'salary/wagetypes/' + this.wagetypeID, moduleID: 13, active: true });
                } else {
                    this.tabService.addTab({ name: 'Lønnsartnr. ' + this.wageType.WageTypeId, url: 'salary/wagetypes/' + this.wagetypeID, moduleID: 13, active: true });
                }

                this.fields = layout.Fields;

                let wageTypeNumber: UniFieldLayout = this.findByProperty(this.fields, 'WageTypeId');
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
                    source: [ {text: 'Lønn'}, {text: 'YtelseFraOffentlige'}, {text: 'PensjonEllerTrygd'}, {text: 'Næringsinntekt'}, {text: 'Fradrag'}, {text: 'Forskuddtrekk'}],
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : ''
                };

                let benefit: UniFieldLayout = this.findByProperty(this.fields, 'Benefit');
                benefit.Options = {
                    source: [ {text: 'Kontantytelse'}, {text: 'Naturalytelse'}, {text: 'Utgiftgodtgjoerelse'}],
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : ''
                };

                let description: UniFieldLayout = this.findByProperty(this.fields, 'Description');
                description.Options = {
                    source: [ {text: 'Fastlønn'} ],
                    valueProperty: 'text',
                    displayProperty: 'text',
                    debounceTime: 200,
                    template: (obj) => obj ? `${obj.text}` : ''
                }

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
