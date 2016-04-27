import {Component, OnInit, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniFormBuilder, UniFormLayoutBuilder, UniForm, UniField} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {SalaryTransactionSelectionList} from '../../salary/salarytrans/salarytransactionSelectionList';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
    providers: [PayrollrunService],
    directives: [UniComponentLoader, SalaryTransactionSelectionList]
})

export class PayrollrunDetails implements OnInit {
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date;
    private payStatusTable: any[];
    private payStatus: string;
    private form: UniFormBuilder = new UniFormBuilder();
    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;
    private isEditable: boolean;
    private busy: boolean = false;
    
    constructor(private routeParams: RouteParams, private payrollrunService: PayrollrunService, private router: Router, private tabSer: TabService) {
        this.payrollrunID = +this.routeParams.get('id');
        if (this.payrollrunID === 0) {
            this.payrollrunID = 1;
        }
    }
    
    public ngOnInit() {
        this.payStatusTable = [
            {ID: 0 || null, text: 'Opprettet'},
            {ID: 1, text: 'Avregnet'},
            {ID: 2, text: 'Godkjent'},
            {ID: 3, text: 'Sendt til utbetaling'},
            {ID: 4, text: 'Utbetalt'},
            {ID: 5, text: 'Bokført'},
            {ID: 6, text: 'Slettet'}
        ];
        this.busy = true;
        if (this.payrollrunID) {
            Observable.forkJoin(
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID),
                this.payrollrunService.layout('payrollrunDetailsForm')
            ).subscribe((response: any) => {
                var [payrollrun, layout] = response;
                this.payrollrun = payrollrun;
                this.payDate = new Date(this.payrollrun.PayDate.toString());
                this.setStatus();
                console.log('paydate: ' + JSON.stringify(this.payrollrun.PayDate));
                this.form = new UniFormLayoutBuilder().build(layout, this.payrollrun);
                
                var field: UniField = this.form.find('StatusCode');
                field.config.setModel(this.setStatus());
                
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = this.form;
                });
                
                this.setEditMode();
                this.form.hideSubmitButton();
                this.tabSer.addTab({name: 'Lønnsavregning #' + this.payrollrunID, url: '/salary/payrollrun/' + this.payrollrunID});
                this.busy = false;
            }
            , error => console.log(error));
        }
    }
    
    private setStatus() {
        var status = this.payStatusTable.find(x => x.ID === this.payrollrun.StatusCode);
        this.payStatus = status.text;
        return status.text;
    }
    
    public previousPayrollrun() {
        this.payrollrunService.getPrevious(this.payrollrunID)
        .subscribe((response) => {
            if (response) {
                this.payrollrun = response;
                this.payrollrunID = this.payrollrun.ID;
                this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
            }
        });
    }
    
    public nextPayrollrun() {
        this.payrollrunService.getNext(this.payrollrunID)
        .subscribe((response) => {
            if (response) {
                this.payrollrun = response;
                this.payrollrunID = this.payrollrun.ID;
                this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
            }
        });
    }
    
    public runSettling() {
        this.busy = true;
        this.payrollrunService.runSettling(this.payrollrunID)
        .subscribe((bResponse: boolean) => {
            if (bResponse === true) {
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                .subscribe((response) => {
                    this.payrollrun = response;
                    this.setEditMode();
                    this.showPaymentList();
                    this.busy = false;
                });
            }
        });
    }
    
    public showPaymentList() {
        this.router.navigateByUrl('/salary/paymentlist/' + this.payrollrun.ID);
    }
    
    public resetSettling() {
        this.payrollrunService.resetSettling(this.payrollrunID)
        .subscribe((bResponse: boolean) => {
            if (bResponse === true) {
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                .subscribe((response) => {
                    this.setEditMode();
                });
            }
            this.form.editMode = this.isEditable;
        });
    }
    
    private setEditMode() {
        if (this.payrollrun.StatusCode > 0) {
            this.isEditable = false;
            this.form.readmode();
        } else {
            this.isEditable = true;
            this.form.editmode();
        }
    }
}
