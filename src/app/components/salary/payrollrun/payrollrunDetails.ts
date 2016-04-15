import {Component, OnInit, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniFormBuilder, UniFormLayoutBuilder, UniForm} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {SalaryTransactionSelectionList} from '../../salary/salarytrans/salarytransactionSelectionList';

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
    providers: [PayrollrunService],
    directives: [UniComponentLoader, SalaryTransactionSelectionList]
})

export class PayrollrunDetails implements OnInit {
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private form: UniFormBuilder = new UniFormBuilder();
    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;
    
    constructor(private routeParams: RouteParams, private payrollrunService: PayrollrunService, private router: Router) {
        this.payrollrunID = +this.routeParams.get('id');
        if (this.payrollrunID === 0) {
            this.payrollrunID = 1;
        }
    }
    
    public ngOnInit() {
        if (this.payrollrunID) {
            
            Observable.forkJoin(
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID),
                this.payrollrunService.layout('payrollrunDetailsForm')
            ).subscribe((response: any) => {
                var [payrollrun, layout] = response;
                this.payrollrun = payrollrun;
                this.form = new UniFormLayoutBuilder().build(layout, this.payrollrun);
                
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
                    cmp.instance.config = this.form;
                });
                
                this.form.hideSubmitButton();
            }
            , error => console.log(error));
        }
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
}
