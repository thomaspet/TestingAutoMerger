import {Component, Type, ViewChild, Input, AfterViewInit, EventEmitter, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UniModal} from '../../../../framework/modals/modal';
import {UniFieldLayout} from 'uniform-ng2/main';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {FieldType, PayrollRun, SalaryTransaction} from '../../../../app/unientities';
import {SalaryTransactionService, PayrollrunService, EmployeeService} from '../../../../app/services/services';
import {Observable} from 'rxjs/Observable';
import {SalaryTransactionPay, SalaryTransactionPayLine, SalaryTransactionSums} from '../../../models/models';
import {ErrorService} from '../../../services/common/ErrorService';

declare var _; // lodash

@Component({
    selector: 'control-modal-content',
    templateUrl: 'app/components/salary/payrollrun/controlModalContent.html'
})
export class ControlModalContent {
    private busy: boolean;
    public formConfig: any = {};
    public payList: { employeeInfo: { name: string, payment: number, hasTaxInfo: boolean }, paymentLines: SalaryTransaction[], collapsed: boolean }[] = null;
    private payrollRun: PayrollRun;
    private payrollRunID: number;
    @Input('config')
    private config: { hasCancelButton: boolean, cancel: any, actions: { text: string, method: any }[], payrollRunID: number };
    private transes: SalaryTransaction[];
    private model: { sums: SalaryTransactionSums, salaryTransactionPay: SalaryTransactionPay } = { sums: null, salaryTransactionPay: null };
    public tableConfig: UniTableConfig;
    public fields: UniFieldLayout[] = [];

    constructor(
        private _salaryTransactionService: SalaryTransactionService,
        private _payrollRunService: PayrollrunService,
        private _employeeService: EmployeeService,
        private _router: Router,
        private route: ActivatedRoute,
        private errorService: ErrorService
    ) {
        this.route.params.subscribe(params => {
            this.payrollRunID = +params['id'];
        });
        this.generateHeadingsForm();
    }

    public getData() {
        this.busy = true;
        return Observable.forkJoin(
            this._salaryTransactionService.GetAll('filter=PayrollRunID eq ' + this.payrollRunID + '&nofilter=true'),
            this._employeeService.getTotals(this.payrollRunID),
            this._payrollRunService.getPaymentList(this.payrollRunID),
            this._payrollRunService.Get(this.payrollRunID)
        );
    }

    public setData(response: any) {
        this.busy = true;
        let [salaryTrans, sums, transPay, payrollrun] = response;
        this.transes = salaryTrans;
        this.transes = _.cloneDeep(this.transes);

        this.model.sums = sums;
        this.model.salaryTransactionPay = transPay;
        this.model = _.cloneDeep(this.model);

        this.payrollRun = payrollrun;
        this.payrollRun = _.cloneDeep(this.payrollRun);

        this.generateTableConfigs();
        this.busy = false;
    }

    private generateHeadingsForm() {
        var withholdingField = new UniFieldLayout();
        withholdingField.FieldType = FieldType.NUMERIC;
        withholdingField.Property = 'salaryTransactionPay.Withholding';
        withholdingField.Label = 'Beregnet forskuddstrekk';
        withholdingField.ReadOnly = true;
        withholdingField.Options = {
            format: 'money'
        };

        var baseVacationPay: UniFieldLayout = new UniFieldLayout();
        baseVacationPay.FieldType = FieldType.NUMERIC;
        baseVacationPay.Property = 'sums.baseVacation';
        baseVacationPay.Label = 'Feriepengegrunnlag';
        baseVacationPay.ReadOnly = true;
        baseVacationPay.Options = {
            format: 'money'
        };

        var baseAga = new UniFieldLayout();
        baseAga.FieldType = FieldType.NUMERIC;
        baseAga.Property = 'sums.baseAGA';
        baseAga.Label = 'Arbeidsgiveravgift grunnlag';
        baseAga.ReadOnly = true;
        baseAga.LineBreak = true;
        baseAga.Options = {
            format: 'money'
        };

        var netPayment = new UniFieldLayout();
        netPayment.FieldType = FieldType.NUMERIC;
        netPayment.Property = 'sums.netPayment';
        netPayment.Label = 'Sum til utbetaling';
        netPayment.ReadOnly = true;
        netPayment.Options = {
            format: 'money'
        };

        var calculatedVacationPay = new UniFieldLayout();
        calculatedVacationPay.FieldType = FieldType.NUMERIC;
        calculatedVacationPay.Property = 'sums.calculatedVacationPay';
        calculatedVacationPay.Label = 'Beregnet feriepenger';
        calculatedVacationPay.ReadOnly = true;
        calculatedVacationPay.Options = {
            format: 'money'
        };

        var calculatedAga = new UniFieldLayout();
        calculatedAga.FieldType = FieldType.NUMERIC;
        calculatedAga.Property = 'sums.calculatedAGA';
        calculatedAga.Label = 'Beregnet arbeidsgiveravgift';
        calculatedAga.ReadOnly = true;
        calculatedAga.Options = {
            format: 'money'
        };

        this.fields = [withholdingField, baseVacationPay, baseAga, netPayment, calculatedVacationPay, calculatedAga];
    }

    private generateTableConfigs() {

        this.payList = [];
        let wagetypeNumberCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', UniTableColumnType.Number).setWidth('6rem');
        let wagetypenameCol = new UniTableColumn('Text', 'Navn', UniTableColumnType.Text);
        let fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date).setWidth('6rem');
        let toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date).setWidth('6rem');
        let accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text).setWidth('5rem');
        let rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money).setWidth('7rem');
        let amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number).setWidth('4rem');
        let sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money).setWidth('7rem');

        this.tableConfig = new UniTableConfig(false, false)
            .setColumns([wagetypeNumberCol, wagetypenameCol, accountCol, fromdateCol, toDateCol, amountCol, rateCol, sumCol]);
        if (this.model.salaryTransactionPay.PayList) {
            this.model.salaryTransactionPay.PayList.forEach((payline: SalaryTransactionPayLine) => {

                let salaryTranses = this.transes.filter(x => x.EmployeeNumber === payline.EmployeeNumber && x.PayrollRunID === this.payrollRunID);
                let section: { employeeInfo: { name: string, payment: number, hasTaxInfo: boolean }, paymentLines: SalaryTransaction[], collapsed: boolean } = {
                    employeeInfo: {
                        name: payline.EmployeeName,
                        payment: payline.NetPayment,
                        hasTaxInfo: payline.HasTaxInformation
                    },
                    paymentLines: salaryTranses,
                    collapsed: true
                };
                this.payList.push(section);
            });
        }

    }

    public runSettling() {
        this.busy = true;
        return this._payrollRunService.runSettling(this.payrollRunID);
    }

    public refresh() {
        this.busy = true;
        this._payrollRunService.controlPayroll(this.payrollRunID).subscribe((response) => {
            this.getData().subscribe((data) => {
                this.setData(data);
            }, err => this.errorService.handle(err));
        }, err => this.errorService.handle(err));
    }

    public showPaymentList() {
        this._router.navigateByUrl('/salary/paymentlist/' + this.payrollRunID);
    }

    public toggleCollapsed(index: number) {
        this.payList[index].collapsed = !this.payList[index].collapsed;
    }
    public closeAll() {
        this.payList.forEach((line) => {
            line.collapsed = true;
        });
    }
}

@Component({
    selector: 'control-modal',
    template: `
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class ControlModal implements AfterViewInit {
    @ViewChild(UniModal) private modal: UniModal;
    @Output() public updatePayrollRun: EventEmitter<any> = new EventEmitter<any>(true);
    private modalConfig: { hasCancelButton: boolean, cancel: any, actions: { text: string, method: any }[] };
    public type: Type<any> = ControlModalContent;

    constructor(private route: ActivatedRoute, private errorService: ErrorService) {
        
        this.modalConfig = {
            hasCancelButton: true,
            cancel: () => {
                this.modal.getContent().then((component: ControlModalContent) => {
                    component.closeAll();
                });
                this.modal.close();
            },
            actions: [{
                text: 'Avregn',
                method: () => {
                    this.modal.getContent().then((content: ControlModalContent) => {
                        content.runSettling().subscribe((success) => {
                            if (success) {
                                this.updatePayrollRun.emit(true);
                                content.showPaymentList();
                            }
                        }, err => this.errorService.handle(err));
                    });
                }
            }]
        };

    }

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openModal() {
        this.modal.getContent().then((modalContent: ControlModalContent) => {
            modalContent.refresh();
            this.modal.open();
        });
    }
}
