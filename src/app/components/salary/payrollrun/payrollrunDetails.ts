import {Component, OnInit, ViewChild, ComponentRef, provide} from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniFormBuilder, UniFormLayoutBuilder, UniForm, UniFieldBuilder} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {SalaryTransactionSelectionList} from '../../salary/salarytrans/salarytransactionSelectionList';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ControlModal} from './controlmodal';
import {RootRouteParamsService} from '../../../services/rootRouteParams';


@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
    providers: [PayrollrunService, provide(RootRouteParamsService, {useClass: RootRouteParamsService})],
    directives: [UniComponentLoader, SalaryTransactionSelectionList, ControlModal]
})

export class PayrollrunDetails implements OnInit {
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date;
    private payStatus: string;
    private form: UniFormBuilder = new UniFormBuilder();
    @ViewChild(UniComponentLoader)
    private uniCmpLoader: UniComponentLoader;
    @ViewChild(ControlModal)
    private controlModal: ControlModal;
    private isEditable: boolean;
    private busy: boolean = false;
    
    constructor(private routeParams: RouteParams, private payrollrunService: PayrollrunService, private router: Router, private tabSer: TabService, private _rootRouteParamsService: RootRouteParamsService) {
        this.payrollrunID = +this.routeParams.get('id');
        if (this.payrollrunID === 0) {
            this.payrollrunID = 1;
        }
        this._rootRouteParamsService.params = this.routeParams;
    }
    
    public ngOnInit() {
        this.busy = true;
        if (this.payrollrunID) {
            Observable.forkJoin(
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID),
                this.payrollrunService.layout('payrollrunDetailsForm')
            ).subscribe((response: any) => {
                var [payrollrun, layout] = response;
                this.payrollrun = payrollrun;
                this.payDate = new Date(this.payrollrun.PayDate.toString());
                this.form = new UniFormLayoutBuilder().build(layout, this.payrollrun);
                
                
                
                this.uniCmpLoader.load(UniForm).then((cmp: ComponentRef<any>) => {
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
        var status = this.payrollrunService.getStatus(this.payrollrun);
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
        var recurringTransCheck: UniFieldBuilder = this.form.find('ExcludeRecurringPosts');
        var noNegativePayCheck: UniFieldBuilder = this.form.find('1');
        if (this.isEditable) {
            recurringTransCheck.enable();
            noNegativePayCheck.enable();
        }else {
            recurringTransCheck.disable();
            noNegativePayCheck.disable();
        }
        
        var statusCode: UniFieldBuilder = this.form.find('StatusCode');
        var statusField = {StatusCode: this.setStatus() };
        statusCode.setModel(statusField);
        statusCode.readmode();
    }
    
    public openModal() {
        this.controlModal.openModal();
    }
}
