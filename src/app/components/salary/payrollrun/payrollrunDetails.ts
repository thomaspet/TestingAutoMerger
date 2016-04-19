import {Component, OnInit, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniFormBuilder, UniFormLayoutBuilder, UniForm} from '../../../../framework/forms';
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
    private form: UniFormBuilder = new UniFormBuilder();
    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;
    private isEditable: boolean;
    
    constructor(private routeParams: RouteParams, private payrollrunService: PayrollrunService, private router: Router, private tabSer: TabService) {
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
        this.tabSer.addTab({name: 'Lønnsavregninger', url: '/salary/payrollrun/1'});
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
        
        console.log('ID run settling...', this.payrollrunID);
        
        this.payrollrunService.runSettling(this.payrollrunID)
        .subscribe((response: PayrollRun) => {
            
            console.log('settling response', response);
            
            if (response) {
                // status for payrollrun is higher than 'registered'
                this.isEditable = false;
            } else {
                this.isEditable = true;
            }
            
            console.log('isEditable', this.isEditable);
            
            this.form.editMode = this.isEditable;
        });
    }
    
    public resetSettling() {
        console.log('ID reset settling...', this.payrollrunID);
        
        this.payrollrunService.resetSettling(this.payrollrunID)
        .subscribe((response: PayrollRun) => {
            
            console.log('reset settling response', response);
            
            if (response) {
                // status for payrollrun is higher than 'registered'
                this.isEditable = false;
            } else {
                this.isEditable = true;
            }
            
            console.log('isEditable', this.isEditable);
            
            this.form.editMode = this.isEditable;
        });
    }
}
