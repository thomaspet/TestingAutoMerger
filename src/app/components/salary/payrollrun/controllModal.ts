import {Component, Type, ViewChildren, QueryList, Injector, Input, Output, EventEmitter, AfterViewInit, OnInit} from 'angular2/core';
import {RouteParams, Router} from 'angular2/router';
import {UniModal} from '../../../../framework/modals/modal';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../framework/forms';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/unitable';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {FieldType, PayrollRun, SalaryTransaction} from '../../../../app/unientities';
import {SalaryTransactionService, PayrollrunService, EmployeeService} from '../../../../app/services/services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'controll-modal-content',
    directives: [UniForm, UniTable],
    providers: [SalaryTransactionService, PayrollrunService, EmployeeService],
    templateUrl: 'app/components/salary/payrollrun/controllmodalcontent.html'
})
export class ControllModalContent implements OnInit {
    private busy: boolean;
    private formConfig: UniFormBuilder = null;
    private payList: {employeeInfo: any, salaryTransactions: UniTableBuilder, collapsed: boolean}[] = [];
    @Input('config')
    private config: any;
    private transes: SalaryTransaction[];
    private model: {sums: any, salaryTransactionPay: any} = {sums: null, salaryTransactionPay: null};
    
    constructor(
        private _salaryTransactionService: SalaryTransactionService, 
        private _payrollRunService: PayrollrunService,
        private _employeeService: EmployeeService,
        private _router: Router) {
            
    }
    
    public ngOnInit() {
        
    }
    
    public getData() {
        this.busy = true;
        return Observable.forkJoin(
            this._salaryTransactionService.GetAll('filter: PayrollRunID eq ' + this.config.payrollRunID),
            this._employeeService.getTotals(this.config.payrollRunID),
            this._payrollRunService.getPaymentList(this.config.payrollRunID)
        );
    }
    
    public setData(response: any, refresh: boolean = false) {
        this.busy = true;
        let [salaryTrans, sums, transPay] = response;
        this.transes = salaryTrans;
        this.model.sums = sums;
        this.model.salaryTransactionPay = transPay;
        if (this.formConfig !== null) {
            this.formConfig.setModel(this.model);
        }else {
            this.generateHeadingsForm();
        }
        this.generateTableConfigs();
        if (refresh) {
            this.busy = false;
        }
    }
    
    private generateHeadingsForm() {
        var withholdingField = new UniFieldBuilder();
        withholdingField.setLabel('Beregnet forskuddstrekk')
            .setModel(this.model)
            .setModelField('salaryTransactionPay.Withholding')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
        
        var baseVacationPay = new UniFieldBuilder();
        baseVacationPay.setLabel('Feriepengegrunnlag')
            .setModel(this.model)
            .setModelField('sums.baseVacation')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
            
        var baseAga = new UniFieldBuilder();
        baseAga.setLabel('Arbeidsgiveravgift grunnlag')
            .setModel(this.model)
            .setModelField('sums.baseAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
        
        var netPayment = new UniFieldBuilder();
        netPayment.setLabel('Sum til utbetaling')
            .setModel(this.model)
            .setModelField('sums.netPayment')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
            
        var calculatedVacationPay = new UniFieldBuilder();
        calculatedVacationPay.setLabel('Beregnet feriepenger')
            .setModel(this.model)
            .setModelField('sums.calculatedVacationPay')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
        
        var calculatedAga = new UniFieldBuilder();
        calculatedAga.setLabel('Beregnet arbeidsgiveravgift')
            .setModel(this.model)
            .setModelField('sums.calculatedAGA')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.NUMERIC]);
        
        this.formConfig = new UniFormBuilder();
        this.formConfig
            .addUniElements(withholdingField, baseVacationPay, baseAga, netPayment, calculatedVacationPay, calculatedAga)
            .hideSubmitButton();
        this.formConfig.readmode();
    }
    
    private generateTableConfigs() {
        this.payList = [];
        var wagetypeNumberCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', 'number');
        var wagetypenameCol = new UniTableColumn('Text', 'Navn', 'string');
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', 'date');
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', 'date');
        var accountCol = new UniTableColumn('Account', 'Konto', 'string');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var sumCol = new UniTableColumn('Sum', 'Sum', 'number');
        this.model.salaryTransactionPay.PayList.forEach((payline) => {
            var salaryTranses = this.transes.filter(x => x.EmployeeNumber === payline.EmployeeNumber && x.PayrollRunID === this.config.payrollRunID);
            var section: any = {
                employeeInfo: {
                    name: payline.EmployeeName,
                    payment: payline.NetPayment,
                    hasTaxInfo: payline.HasTaxInformation
                },
                salaryTransactions: new UniTableBuilder(salaryTranses, false)
                    .setColumnMenuVisible(false)
                    .setSearchable(false)
                    .setPageable(false),
                collapsed: false
            };
            section.salaryTransactions
                .addColumns(wagetypeNumberCol, wagetypenameCol, accountCol, fromdateCol, toDateCol, amountCol, rateCol, sumCol);
            this.payList.push(section);
        });
    }
    
    public runSettling() {
        this.busy = true;
        return this._payrollRunService.runSettling(this.config.payrollRunID);
    }
    
    public refresh() {
        this.busy = true;
        this._payrollRunService.runSettling(this.config.payrollRunID, false).subscribe((response) => {
            this.getData().subscribe((data) => {
                this.setData(data, true);
            }, error => console.log(error));
        }, error => console.log(error));
    }
    
    public showPaymentList() {
        console.log('config: ' + JSON.stringify(this.config));
        this._router.navigateByUrl('/salary/paymentlist/' + this.config.payrollRunID);
    }
    
    public toggleCollapsed(index: number) {
        this.payList[index].collapsed = !this.payList[index].collapsed;
    }
}

@Component({
    selector: 'controll-modal',
    directives: [UniModal],
    providers: [PayrollrunService],
    template: `
        <button type="button" (click)="openModal()">kontroller</button>
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class ControllModal implements AfterViewInit {
    private payrollRunID: number;
    @ViewChildren(UniModal)
    private modalElements: QueryList<UniModal>;
    private modals: UniModal[];
    private modalConfig: any = {};
    private type: Type = ControllModalContent;
    
    constructor(public injector: Injector, private _payrollRunService: PayrollrunService) {
        
        if (!this.payrollRunID) {
            var routeParams = this.injector.parent.parent.get(RouteParams);
            this.payrollRunID = +routeParams.get('id');
        }
        var self = this;
        self.modalConfig = {
            title: 'Kontroll ',
            value: 'Ingen verdi',
            hasCancelButton: true,
            cancel: () => {
                self.modals[0].close();
            },
            actions: [{
                text: 'Avregn',
                method: () => {
                    self.modals[0].getContent().then((content: ControllModalContent) => {
                        content.runSettling().subscribe((success) => {
                            if (success) {
                                content.showPaymentList();
                            }
                        });
                    });
                }
            }],
            payrollRunID: self.payrollRunID
        };
    }
    
    public ngAfterViewInit() {
        this.modals = this.modalElements.toArray();
    }
    
    public openModal() {
        this.modals[0].getContent().then((modalContent: ControllModalContent) => {
            modalContent.refresh();
            this.modals[0].open();
        });
    }
}
