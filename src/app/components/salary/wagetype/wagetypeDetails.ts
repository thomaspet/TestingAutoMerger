import {Component, ViewChild} from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import {WageTypeService} from '../../../services/services';
import {UniForm, UniFieldLayout} from '../../../../framework/uniForm';
import {WidgetPoster} from '../../../../framework/widgetPoster/widgetPoster';
import {WageType} from '../../../unientities';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {Observable} from 'rxjs/Observable';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

declare var _; // lodash

@Component({
    selector: 'wagetype-details',
    templateUrl: 'app/components/salary/wagetype/wagetypeDetails.html',
    providers: [WageTypeService],
    directives: [UniForm, UniSave, WidgetPoster]
})
export class WagetypeDetail {
    private wageType: WageType;
    private wagetypeID: number;
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre lønnsart',
            action: this.saveWagetype.bind(this),
            main: true,
            disabled: true
        }
    ];
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;

    constructor(private routeparams: RouteParams, private router: Router, private wageService: WageTypeService, private tabService: TabService) {

        this.config = {
            submitText: ''
        };
        this.wagetypeID = +this.routeparams.get('id');
        this.getLayoutAndData();
    }

    private getLayoutAndData() {
        Observable.forkJoin(
            this.wageService.getWageType(this.wagetypeID),
            this.wageService.layout('WagetypeDetails')
        ).subscribe(
            (response: any) => {
                let [wagetype, layout] = response;

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
                this.fields = _.cloneDeep(this.fields);

                this.config = {
                    submitText: ''
                };
                this.toggleAccountNumberBalanceHidden();
            }, 
            (err) => {
                this.log(err);
                console.log('Feil ved henting av lønnsart', err);
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
        }, 100);
    }

    public ready(value) {
        console.log('form ready');
    }

    public change(value) {
        this.toggleAccountNumberBalanceHidden();
        this.saveactions[0].disabled = false;
    }

    public saveWagetype(done) {
        done('Lagrer lønnsart');
        if (this.wageType.ID > 0) {
            this.wageService.Put(this.wageType.ID, this.wageType)
                .subscribe((wagetype) => {
                    this.wageType = wagetype;
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                },
                (err) => {
                    this.log(err);
                    console.log('Feil ved oppdatering av lønnsart', err);
                });
        } else {
            this.wageService.Post(this.wageType)
                .subscribe((wagetype) => {
                    this.wageType = wagetype;
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/wagetypes/' + this.wageType.ID);
                },
                (err) => {
                    this.log(err);
                    console.log('Feil ved lagring av lønnsart', err);
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

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }

    }
}
