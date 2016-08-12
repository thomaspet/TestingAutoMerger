import {Component, Input, ViewChildren, OnChanges, EventEmitter, Output, ViewChild, QueryList, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniFormBuilder} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, AGAZone, WageType, PayrollRun, Employment, SalaryTransaction} from '../../../unientities';
import {EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService, PayrollrunService} from '../../../services/services';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {AsyncPipe} from '@angular/common';
import {ControlModal} from '../payrollrun/controlModal';
import {PostingsummaryModal} from '../payrollrun/postingsummaryModal';
import {UniTable, UniTableColumnType, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {UniForm} from '../../../../framework/uniform';

declare var _;

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html',
    directives: [UniTable, UniComponentLoader, UniSave, UniForm, ControlModal, PostingsummaryModal],
    providers: [EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService],
    pipes: [AsyncPipe]
})

export class SalaryTransactionEmployeeList implements OnChanges, AfterViewInit {
    private salarytransEmployeeTableConfig: any;
    private salarytransEmployeeTotalsTableConfig: any;
    private employeeTotals: any[] = [];
    private wagetypes: WageType[] = [];
    public employee: Employee;
    private agaZone: AGAZone;
    public form: UniFormBuilder = new UniFormBuilder();
    public formModel: any = {};


    private employeeExpands: string[] = [
        'BusinessRelationInfo',
        'SubEntity.BusinessRelationInfo',
        'Employments'
    ];

    public config: any = {};
    public fields: any[] = [];

    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(ControlModal) private controllModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;

    @Input() private employeeID: number;
    private payrollRun: PayrollRun;

    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public salarytransListReady: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChildren(UniTable) public tables: QueryList<UniTable>;

    private busy: boolean;
    private salarytransChanged: any[] = [];
    private salarytransItems$: Observable<any>;
    private saveactions: IUniSaveAction[] = [];

    constructor(
        public employeeService: EmployeeService,
        private _agaZoneService: AgaZoneService,
        private _uniHttpService: UniHttp,
        private _wageTypeService: WageTypeService,
        private salarytransService: SalaryTransactionService,
        private _payrollRunService: PayrollrunService,
        private router: Router) {
        this.busy = true;

        this.createTotalTableConfig();


        this._wageTypeService.GetAll('').subscribe((wagetype: WageType[]) => {
            this.wagetypes = wagetype;
            if (this.payrollRun) {
                this.createTableConfig();
            }
        }, (error: any) => {
            this.log(error);
            console.log(error);
        });

        this._payrollRunService.refreshPayrollRun$.subscribe((payrollRun: PayrollRun) => {
            this.busy = true;
            this.payrollRun = payrollRun;
            if (this.tables && this.employeeID) {
                this.employeeService.get(this.employeeID, this.employeeExpands)
                    .subscribe((response: any) => {
                        this.employee = response;
                        this.setUnitableSource();
                        this.refreshSaveActions();
                        this.setUnitableSource();
                        if (this.wagetypes) {
                            this.createTableConfig();
                        }
                        this.getAgaAndShowView();
                    }, (error: any) => {
                        this.log(error);
                        console.log(error);
                    });
            }


        });

        this.config = {
            submitText: ''
        };

        this.agaZone = new AGAZone();
        this.busy = true;
    }

    public ngOnChanges() {
        this.busy = true;
        if (this.tables && this.employeeID) {
            this.employeeService.get(this.employeeID, this.employeeExpands)
                .subscribe((response: any) => {
                    this.employee = response;
                    this.setUnitableSource();
                    this.getAgaAndShowView();

                }, (error: any) => {
                    this.log(error);
                    console.log(error);
                });
        }
    }

    public ngAfterViewInit() {
        this.salarytransListReady.emit(true);
    }

    public refreshPayrollRun(value) {
        this._payrollRunService.Get(this.payrollRun.ID).subscribe((response: PayrollRun) => {
            this._payrollRunService.refreshPayrun(response);
        });
    }

    private refreshSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre lønnsposter',
                action: this.saveSalarytrans.bind(this),
                main: true,
                disabled: this.payrollRun.StatusCode > 0
            },
            {
                label: 'Kontroller',
                action: this.openControlModal.bind(this),
                main: false,
                disabled: this.payrollRun.StatusCode > 0
            },
            {
                label: 'Avregn',
                action: this.runSettle.bind(this),
                main: false,
                disabled: this.payrollRun.StatusCode > 0
            },
            {
                label: 'Utbetalingsliste',
                action: this.showPayList.bind(this),
                main: false,
                disabled: this.payrollRun.StatusCode < 1
            },
            {
                label: 'Bokfør',
                action: this.openPostingSummaryModal.bind(this),
                main: false,
                disabled: this.payrollRun.StatusCode !== 1
            }
        ];
    }

    public getNext() {
        this.nextEmployee.emit(this.employeeID);
    }

    public getPrevious() {
        this.previousEmployee.emit(this.employeeID);
    }

    public saveSalarytrans(done) {
        this.saveactions[0].disabled = true;
        done('Lagrer lønnsposter');
        this.payrollRun.transactions = this.salarytransChanged;
        this.payrollRun.transactions.forEach((trans: SalaryTransaction) => {
            trans.Wagetype = null;
        });
        this._payrollRunService.Put(this.payrollRun.ID, this.payrollRun).subscribe((response) => {
            this.salarytransChanged = [];
            this.refreshSalaryTransTable();
            this.setUnitableSource();
            this.refreshSaveActions();
            done('Lønnsposter lagret: ');
        },
            (err) => {
                this.log(err);
                done('Feil ved lagring av lønnspost', err);
                this.saveactions[0].disabled = false;
            });

    }

    public ready(value) {

    }

    public change(value) {

    }

    public isDirty(): boolean {
        return (this.salarytransChanged.length > 0);
    }
    private refreshSalaryTransTable() {
        this.salarytransItems$ = _.cloneDeep(this.salarytransItems$);
    }
    private getAgaAndShowView() {
        if (this.employee.SubEntity) {
            this._agaZoneService
                .Get(this.employee.SubEntity.AgaZone)
                .subscribe((agaResponse: AGAZone) => {
                    this.agaZone = agaResponse;
                    if (this.fields.length !== 0) {
                        this.formModel.aga = this.agaZone;
                        this.formModel.employee = this.employee;
                        this.fields = _.cloneDeep(this.fields);
                    }
                    this.busy = false;
                }, (error: any) => {
                    this.log(error);
                    console.log(error);
                });
        } else {
            this.agaZone = new AGAZone();
            if (this.fields.length !== 0) {
                this.formModel.aga = this.agaZone;
                this.formModel.employee = this.employee;
                this.fields = _.cloneDeep(this.fields);
            }
            this.busy = false;
        }
    }

    private buildFilter() {
        if (this.payrollRun.ID === undefined) {
            return 'EmployeeID eq ' + this.employeeID;
        } else {
            return 'EmployeeID eq ' + this.employeeID
                + ' and PayrollRunID eq ' + this.payrollRun.ID;
        }
    }

    private createTableConfig() {
        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date);
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date);
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
        var amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        var sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number, false);
        var employmentidCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return this.getEmploymentJobName(dataItem.EmploymentID);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    let matching: Employment[] = [];
                    if (this.employee.Employments) {
                        this.employee.Employments.forEach(employment => {
                            if (employment.JobName.toLowerCase().indexOf(searchValue) > -1) {
                                matching.push(employment);
                            }
                        });
                    }
                    return matching;
                }
            });
        var accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text);
        var payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                if (!dataItem.Wagetype) {
                    return;
                }
                if (dataItem.Wagetype.Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', UniTableColumnType.Number, false)
            .setTemplate((dataItem) => {
                if (!dataItem.IsRecurringPost === null) {
                    return;
                }
                if (dataItem.IsRecurringPost) {
                    return 'Fast';
                } else {
                    return 'Variabel';
                }
            });

        var wageTypeCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return dataItem.WageTypeNumber;
            })
            .setEditorOptions({
                itemTemplate: (selectedItem: WageType) => {
                    return (selectedItem.WageTypeNumber + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    let matching: WageType[] = [];

                    this.wagetypes.forEach(wagetype => {
                        if (isNaN(searchValue)) {
                            if (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        } else {
                            if (wagetype.WageTypeNumber.toString().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        }
                    });
                    return matching;
                }
            });

        this.salarytransEmployeeTableConfig = new UniTableConfig(this.payrollRun.StatusCode < 1)
            .setDeleteButton({
                deleteHandler: (rowModel: SalaryTransaction) => {
                    if (isNaN(rowModel.ID)) { return true; }                    
                    if (!rowModel.IsRecurringPost) {                        
                        return this.salarytransService.delete(rowModel.ID);                        
                    }      
                    return false;              
                }                
            })
            .setColumns([
                wageTypeCol, wagetypenameCol, employmentidCol,
                fromdateCol, toDateCol, accountCol, amountCol, rateCol, sumCol,
                transtypeCol, payoutCol
            ])
            .setPageable(false)
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === 'WageTypeNumber') {
                    this.mapWagetypeToTrans(row);
                }

                if (event.field === '_Employment') {

                    this.mapEmploymentToTrans(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                return row;
            })
            .setIsRowReadOnly((rowModel: SalaryTransaction) => {
                return rowModel.IsRecurringPost;
            });
    }

    public deleteSalaryTransaction(event) {
        let rowModel = event.rowModel;
        rowModel.Deleted = true;
        this.salarytransService.delete(rowModel.ID).subscribe(
            (response) => {

            },
            err => {
                this.log(err);
            });
    }

    private createTotalTableConfig() {
        var percentCol = new UniTableColumn('percentTax', 'Prosenttrekk', UniTableColumnType.Number);
        var taxtableCol = new UniTableColumn('tableTax', 'Tabelltrekk', UniTableColumnType.Number);
        var paidCol = new UniTableColumn('netPayment', 'Utbetalt beløp', UniTableColumnType.Number);
        var agaCol = new UniTableColumn('calculatedAGA', 'Beregnet AGA', UniTableColumnType.Number);
        var basevacationCol = new UniTableColumn('baseVacation', 'Grunnlag feriepenger', UniTableColumnType.Number);

        this.salarytransEmployeeTotalsTableConfig = new UniTableConfig()
            .setColumns([
                percentCol, taxtableCol, paidCol, agaCol, basevacationCol
            ])
            .setEditable(false)
            .setPageable(false)
            .setSearchable(false);
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['WageTypeNumber'];
        if (!wagetype) {
            return;
        }
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Wagetype'] = wagetype;
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = this.payrollRun.FromDate;
        rowModel['ToDate'] = this.payrollRun.ToDate;
        rowModel['_BasePayment'] = wagetype.Base_Payment;
        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
        }

        if (!rowModel.Rate || wagetype.Rate) {
            rowModel['Rate'] = wagetype.Rate;
        }

        if (this.employee.Employments && this.employee.Employments.length === 1) {
            rowModel['_Employment'] = this.employee.Employments[0];
            rowModel['EmploymentID'] = this.employee.Employments[0].ID;
        }
        this.calcItem(rowModel);
    }

    private mapEmploymentToTrans(rowModel) {
        let employment = rowModel['_Employment'];
        if (!employment) {
            return;
        }
        rowModel['EmploymentID'] = employment.ID;
    }

    private calcItem(rowModel) {
        let sum = rowModel['Amount'] * rowModel['Rate'];
        rowModel['Sum'] = sum;
    }

    private setUnitableSource() {
        var filter = this.buildFilter();

        this.salarytransItems$ = this._uniHttpService.asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({
                filter: filter,
                expand: '@Wagetype'
            })
            .map(response => response.json());

        this.employeeService.getTotals(this.payrollRun.ID, this.employeeID)
            .subscribe((response) => {
                if (response) {
                    this.employeeTotals = [response];
                }
            }, (error: any) => {
                this.log(error);
                console.log(error);
            });
    }

    private getEmploymentJobName(employmentID: number) {
        var jobName = '';
        if (this.employee.Employments) {
            this.employee.Employments.forEach((employment: Employment) => {
                if (employment.ID === employmentID) {
                    jobName = employment.JobName;
                }
            });
        }

        return jobName;
    }

    public rowChanged(event) {
        let updated: boolean = false;
        let row: SalaryTransaction = event.rowModel;

        if (row.FromDate) {
            row.FromDate = new Date(row.FromDate.toString());
            row.FromDate.setHours(12);
        }
        if (row.ToDate) {
            row.ToDate = new Date(row.ToDate.toString());
            row.ToDate.setHours(12);
        }

        if (row.Wagetype || row.Text || row['_Employment'] || row.FromDate || row.ToDate || row.Account || row.Amount || row.Rate) {
            row['EmployeeID'] = this.employeeID;
            row['PayrollRunID'] = this.payrollRun.ID;
            row['_createguid'] = this.salarytransService.getNewGuid();

            if (this.salarytransChanged.length > 0) {
                for (var i = 0; i < this.salarytransChanged.length; i++) {
                    var salaryItem = this.salarytransChanged[i];
                    if (row['_originalIndex'] === salaryItem._originalIndex) {
                        this.salarytransChanged[i] = row;
                        updated = true;
                        break;
                    }
                }
                if (!updated) {
                    this.salarytransChanged.push(row);
                }
            } else {
                this.salarytransChanged.push(row);
            }
        }
        this.saveactions[0].disabled = false;
    }

    public showPayList(done) {
        this.router.navigateByUrl('/salary/paymentlist/' + this.payrollRun.ID);
    }

    public runSettle(done) {
        done('kjører lønnsavregning: ');
        this.busy = true;
        this._payrollRunService.runSettling(this.payrollRun.ID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this._payrollRunService.Get<PayrollRun>(this.payrollRun.ID)
                        .subscribe((response: PayrollRun) => {
                            this._payrollRunService.refreshPayrun(response);
                            this.showPayList.bind(done);
                            this.refreshSaveActions();
                            done('Lønnsavregning avregnet: ');
                            this.busy = false;
                        });
                }
            });

    }

    public openPostingSummaryModal(done) {
        this.postingSummaryModal.openModal();
        done('');
    }

    public openControlModal(done) {
        this.controllModal.openModal();
        done('');
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }
}
