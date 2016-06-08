import {Component, OnInit, ViewChild, provide} from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {SalaryTransactionSelectionList} from '../../salary/salarytrans/salarytransactionSelectionList';
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {ControlModal} from './controlModal';
import {PostingsummaryModal} from './postingsummaryModal';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';

declare var _;

@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
    providers: [PayrollrunService, provide(RootRouteParamsService, {useClass: RootRouteParamsService})],
    directives: [SalaryTransactionSelectionList, ControlModal, PostingsummaryModal, UniSave, UniForm]
})

export class PayrollrunDetails implements OnInit {
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date;
    private payStatus: string;
    @ViewChild(ControlModal) private controlModal: ControlModal;
    private isEditable: boolean;
    private busy: boolean = false;
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre lønnsavregning',
            action: this.savePayrollrun.bind(this),
            main: true,
            disabled: true
        }
    ];
    
    private formIsReady: boolean = false;
    
    constructor(private routeParams: RouteParams, private payrollrunService: PayrollrunService, private router: Router, private tabSer: TabService, private _rootRouteParamsService: RootRouteParamsService) {
        this.payrollrunID = +this.routeParams.get('id');
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
                
                this.fields = layout.Fields;
                
                this.config = {
                    submitText: ''
                };
                
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
        });
    }
    
    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field; 
    }
    
    private setEditMode() {
        if (this.payrollrun.StatusCode > 0) {
            this.isEditable = false;
            this.uniform.readMode();
        } else {
            this.isEditable = true;
            this.uniform.editMode();
            var idField: UniFieldLayout = this.findByProperty(this.fields, 'ID');
            idField.ReadOnly = true;
        }
        var recurringTransCheck: UniFieldLayout = this.findByProperty(this.fields, 'ExcludeRecurringPosts');
        var noNegativePayCheck: UniFieldLayout = this.findByProperty(this.fields, '1');
        if (this.isEditable) {
            recurringTransCheck.ReadOnly = false;
            noNegativePayCheck.ReadOnly = false;
        }else {
            recurringTransCheck.ReadOnly = true;
            noNegativePayCheck.ReadOnly = true;
        }
        
        var statusCode: UniFieldLayout = this.findByProperty(this.fields, 'StatusCode');
        statusCode.StatusCode = this.setStatus();
        statusCode.ReadOnly = true;
        
        this.fields = _.cloneDeep(this.fields);
    }
    
    public ready(value) {
        this.setEditMode();
        this.formIsReady = true;
        setTimeout(() => {
            this.uniform.section(1).toggle();
        }, 100);
    }
    
    public change(value) {
        this.saveactions[0].disabled = false;
    }
    
    public savePayrollrun(done) {
        done('Lagrer lønnsavregning');
        if (this.payrollrun.ID > 0) {
            this.payrollrunService.Put(this.payrollrun.ID, this.payrollrun)
            .subscribe((response: PayrollRun) => {
                this.payrollrun = response;
                done('Sist lagret: ');
                this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrun.ID);
                this.uniform.section(1).toggle();
            },
            (err) => {
                console.log('Feil ved oppdatering av lønnsavregning', err);
            });
        } else {
            this.payrollrunService.Post(this.payrollrun)
            .subscribe((response: PayrollRun) => {
                this.payrollrun = response;
                done('Sist lagret: ');
                this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrun.ID);
            },
            (err) => {
                console.log('Feil ved lagring', err);
            });
        }
    }
    
    public openModal() {
        this.controlModal.openModal();
    }
    
    public createNewRun() {
        var createdPayrollrun = new PayrollRun();
        var dates: Date[] = this.payrollrunService.getEmptyPayrollrunDates();
        createdPayrollrun.FromDate = dates[0];
        createdPayrollrun.ToDate = dates[1];
        createdPayrollrun.PayDate = dates[2];
        this.payrollrunService.Post(createdPayrollrun)
        .subscribe((response) => {
            this.router.navigateByUrl('/salary/payrollrun/' + response.ID);
        },
        (err) => console.log('Error creating payrollrun: ', err));
    }
}
