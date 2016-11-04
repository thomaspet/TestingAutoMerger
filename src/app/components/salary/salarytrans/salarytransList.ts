import { Component, Input, ViewChildren, OnChanges, EventEmitter, Output, ViewChild, QueryList, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, AGAZone, WageType, PayrollRun, SalaryTransaction, SalaryTransactionSums, WageTypeSupplement, SalaryTransactionSupplement } from '../../../unientities';
import { EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService, PayrollrunService } from '../../../services/services';
import { IUniSaveAction } from '../../../../framework/save/save';
import { ControlModal } from '../payrollrun/controlModal';
import { PostingsummaryModal } from '../payrollrun/postingsummaryModal';
import { UniTable, UniTableColumnType, UniTableColumn, UniTableConfig, IContextMenuItem } from 'unitable-ng2/main';
import { UniForm } from '../../../../framework/uniform';
import { SalaryTransactionSupplementsModal } from '../modals/salaryTransactionSupplementsModal';
import { ISummaryConfig } from '../../common/summary/summary';

declare var _;

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html'
})

export class SalaryTransactionEmployeeList implements OnChanges, AfterViewInit, OnInit {
    private salarytransEmployeeTableConfig: UniTableConfig;
    private employeeTotals: SalaryTransactionSums;
    private wagetypes: WageType[] = [];
    public employee: Employee;
    private agaZone: AGAZone;
    public formModel: any = {};
    public errorMessage: string = '';
    public dirty: boolean = false;
    public summary: ISummaryConfig[] = [];

    private employeeExpands: string[] = [
        'BusinessRelationInfo',
        'SubEntity.BusinessRelationInfo',
        'Employments',
        'BankAccounts'
    ];

    public config: any = {};
    public fields: any[] = [];

    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(ControlModal) private controllModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;
    @ViewChild(SalaryTransactionSupplementsModal) private supplementModal: SalaryTransactionSupplementsModal;

    @Input() private employeeID: number;

    private payrollRun: PayrollRun;

    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public salarytransListReady: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChild(UniTable) public table: UniTable;

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

    }

    public ngOnInit() {

        this.busy = true;

        this._wageTypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetype: WageType[]) => {
            this.wagetypes = wagetype;
            if (this.payrollRun && this.employee) {
                this.createTableConfig();
            }
        }, (error: any) => {
            this.log(error);
            console.log(error);
        });

        this._payrollRunService.refreshPayrollRun$.subscribe((payrollRun: PayrollRun) => {
            this.busy = true;
            this.payrollRun = payrollRun;
            this.employeeTotals = null;
            this.setSums();
            if (this.table && this.employeeID) {
                this.employeeService.get(this.employeeID, this.employeeExpands)
                    .subscribe((response: any) => {
                        this.employee = response;
                        this.refreshSaveActions();
                        this.setSummarySource();
                        this.setSalaryTransactionsSource();
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
        if (this.table && this.employeeID && this.payrollRun) {
            this.busy = true;
            this.dirty = false;
            this.employeeTotals = null;
            this.setSums();
            this.setSummarySource();
            this.employeeService.get(this.employeeID, this.employeeExpands)
                .subscribe((response: any) => {
                    this.employee = response;
                    this.setSalaryTransactionsSource();
                    this.getAgaAndShowView();
                    this.salarytransChanged = [];
                    if (this.salarytransEmployeeTableConfig) {
                        this.salarytransEmployeeTableConfig.columns.find(x => x.field === '_Employment').editorOptions = {
                            resource: this.employee.Employments,
                            itemTemplate: (item) => {
                                return item ? item.ID + ' - ' + item.JobName : '';
                            }
                        };
                        this.salarytransEmployeeTableConfig = _.cloneDeep(this.salarytransEmployeeTableConfig); // Trigger change detection in unitable
                    }

                }, (error: any) => {
                    this.log(error);
                    console.log(error);
                });
        }
    }

    public ngAfterViewInit() {
        this.salarytransListReady.emit(true);
    }

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
                action: (done) => this.saveSalarytrans(done),
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
        this.payrollRun.transactions = this.salarytransChanged;
        this.employeeTotals = null;
        this.setSums();
        this.payrollRun.transactions.forEach((trans: SalaryTransaction) => {
            trans.Wagetype = null;
            trans.Employee = null;
            if (trans.Supplements) {
                trans.Supplements.forEach((supplement: SalaryTransactionSupplement) => {
                    if (!supplement.ID) {
                        supplement['_createguid'] = this._payrollRunService.getNewGuid();
                    }
                    supplement.WageTypeSupplement = null;
                });
            }
        });
        this._payrollRunService.Put(this.payrollRun.ID, this.payrollRun).subscribe((response) => {
            this.salarytransChanged = [];
            this.dirty = false;
            this.setSalaryTransactionsSource();
            this.setSummarySource();
            this.refreshSaveActions();
            done('Lønnsposter lagret: ');
        },
            (err) => {
                this.log(err);
                done('Feil ved lagring av lønnspost', err);
                this.saveactions[0].disabled = false;
                this.setSummarySource();
            });

    }

    public ready(value) {

    }

    public change(value) {

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
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);
        var amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        var sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money, false);
        var employmentidCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Select)
            .setTemplate((dataItem) => {

                if (!dataItem['_Employment'] && !dataItem['EmploymentID']) {
                    return '';
                }

                let employment = dataItem['_Employment'] || this.getEmploymentFromEmployee(dataItem.EmploymentID);

                dataItem['_Employment'] = employment;

                return employment ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setEditorOptions({
                resource: this.employee.Employments,
                itemTemplate: (item) => {
                    return item ? item.ID + ' - ' + item.JobName : '';
                }
            });

        var accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text).setAlignment('right');
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

        var wageTypeCol = new UniTableColumn('Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
            .setDisplayField('WageTypeNumber')
            .setEditorOptions({
                itemTemplate: (selectedItem: WageType) => {
                    return (selectedItem.WageTypeNumber + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    return this.wagetypes.filter((wagetype) => {
                        if (isNaN(searchValue)) {
                            return (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1);
                        } else {
                            return wagetype.WageTypeNumber.toString().startsWith(searchValue.toString());
                        }
                    });
                }
            });

        this.salarytransEmployeeTableConfig = new UniTableConfig(this.payrollRun.StatusCode < 1)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.openSuplementaryInformationModal(row);
                }
            }])
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

                if (event.field === 'Wagetype') {
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
            .setDefaultRowData({
                EmployeeID: this.employeeID,
                Employee: this.employee
            })
            .setIsRowReadOnly((rowModel: SalaryTransaction) => {
                return rowModel.IsRecurringPost;
            });
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['Wagetype'];
        if (!wagetype) {
            return;
        }
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Wagetype'] = wagetype;
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = this.fixTimezone(this.payrollRun.FromDate);
        rowModel['ToDate'] = this.fixTimezone(this.payrollRun.ToDate);
        rowModel['_BasePayment'] = wagetype.Base_Payment;
        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
        }

        if (!rowModel.Rate || wagetype.Rate) {
            rowModel['Rate'] = wagetype.Rate;
        }

        let employment = this.employee.Employments.find(emp => emp.Standard === true);
        if (employment) {
            rowModel['EmploymentID'] = employment.ID;
        }

        let supplements: SalaryTransactionSupplement[] = [];

        if (rowModel['Supplements']) {
            rowModel['Supplements']
                .filter(x => x.ID)
                .forEach((supplement: SalaryTransactionSupplement) => {
                    supplement.Deleted = true;
                    supplements.push(supplement);
                });
        }

        if (wagetype.SupplementaryInformations) {

            wagetype.SupplementaryInformations.forEach((supplement: WageTypeSupplement) => {
                let transSupplement = new SalaryTransactionSupplement();
                transSupplement.WageTypeSupplementID = supplement.ID;
                transSupplement.WageTypeSupplement = supplement;
                supplements.push(transSupplement);
            });
            rowModel['Supplements'] = supplements;
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
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        let amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        let ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        let sum = (Math.round((amountPrecision * rowModel['Amount'])) * Math.round((ratePrecision * rowModel['Rate']))) / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
    }

    private setSalaryTransactionsSource() {
        var filter = this.buildFilter();

        this.salarytransItems$ = this._uniHttpService.asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({
                filter: filter,
                expand: '@Wagetype.SupplementaryInformations,@Supplements.WageTypeSupplement'
            })
            .map(response => response.json());
    }

    private setSummarySource() {
        this.employeeService.getTotals(this.payrollRun.ID, this.employeeID)
            .subscribe((response) => {
                if (response) {
                    this.employeeTotals = response;
                    this.setSums();
                }
            }, (error: any) => {
                this.log(error);
                console.log(error);
            });
    }



    private setSums() {
        this.summary = [{
            value: this.employeeTotals ? this.employeeTotals.percentTax.toString() : null,
            title: 'Prosenttrekk',
            description: this.employeeTotals && this.employeeTotals.basePercentTax ? `av ${this.employeeTotals.basePercentTax}` : null
        }, {
            value: this.employeeTotals ? this.employeeTotals.tableTax.toString() : null,
            title: 'Tabelltrekk',
            description: this.employeeTotals && this.employeeTotals.baseTableTax ? `av ${this.employeeTotals.baseTableTax}` : null
        }, {
            title: 'Utbetalt beløp',
            value: this.employeeTotals ? this.employeeTotals.netPayment.toString() : null
        }, {
            title: 'Beregnet AGA',
            value: this.employeeTotals ? this.employeeTotals.calculatedAGA.toString() : null
        }, {
            title: 'Grunnlag feriepenger',
            value: this.employeeTotals ? this.employeeTotals.baseVacation.toString() : null
        }];
    }

    private getEmploymentFromEmployee(employmentID: number) {
        if (this.employee.Employments && employmentID) {
            return this.employee.Employments.find(x => x.ID === employmentID);
        }

        return null;
    }

    public openSuplementaryInformationModal(row: SalaryTransaction) {
        this.supplementModal.openModal(row);
    }

    public updateSingleSalaryTransaction(trans: SalaryTransaction) {
        if (trans) {
            let rows: SalaryTransaction[] = this.table.getTableData();
            let row: SalaryTransaction = rows.find(x => x.ID === trans.ID);
            if (row) {
                row.Supplements = trans.Supplements;
                this.updateSalaryChanged(row);
                this.table.updateRow(row['_originalIndex'], row);
            }
        }
    }

    public rowChanged(event) {
        let row: SalaryTransaction = event.rowModel;

        if (row.FromDate) {
            row.FromDate = this.fixTimezone(row.FromDate);
        }
        if (row.ToDate) {
            row.ToDate = this.fixTimezone(row.ToDate);
        }

        if (row.Wagetype || row.Text || row['_Employment'] || row.FromDate || row.ToDate || row.Account || row.Amount || row.Rate) {
            row['EmployeeID'] = this.employeeID;
            row['PayrollRunID'] = this.payrollRun.ID;
            row['_createguid'] = this.salarytransService.getNewGuid();

            this.updateSalaryChanged(row);

        }

        this.saveactions[0].disabled = false;
        this.dirty = (this.salarytransChanged.length > 0);
    }

    private updateSalaryChanged(row) {
        let updated: boolean = false;
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

    public showPayList(done) {
        this.router.navigateByUrl('/salary/paymentlist/' + this.payrollRun.ID);
    }

    public runSettle(done) {
        done('kjører lønnsavregning: ');
        this.busy = true;
        this.saveactions[0].disabled = true;
        this.saveactions = _.cloneDeep(this.saveactions);
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
                            this.saveactions[0].disabled = false;
                            this.saveactions = _.cloneDeep(this.saveactions);
                        }, error => {
                            this.log(error);
                            this.busy = false;
                            this.saveactions[0].disabled = false;
                            this.saveactions = _.cloneDeep(this.saveactions);
                        });
                }
            }, error => {
                this.log(error);
                this.busy = false;
                this.saveactions[0].disabled = false;
                this.saveactions = _.cloneDeep(this.saveactions);
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

    public noActiveBankAccounts(): boolean {
        return !this.employee.BankAccounts.some(x => x.Active === true);
    }

    public generateErrorMessage(): string {
        let error = `Gå til <a href="/#/salary/employees/${this.employee.ID}"> ansattkortet for ${this.employee.BusinessRelationInfo.Name}</a> for å legge inn `;
        let noBankAccounts = (!this.employee.BankAccounts) || this.noActiveBankAccounts();
        let noTax = !this.employee.TaxTable && !this.employee.TaxPercentage;

        if (noBankAccounts && noTax) {
            error = 'Skatteinfo og kontonummer mangler. ' + error + 'skatteinfo og kontonummer.';
        } else if (noBankAccounts) {
            error = 'Kontonummer mangler. ' + error + 'kontonummer.';
        } else if (noTax) {
            error = 'Skatteinfo mangler. ' + error + 'skatteinfo.';
        }

        return error;
    }

    public hasError(): boolean {
        let noBankAccounts = (!this.employee.BankAccounts) || this.noActiveBankAccounts();
        let noTax = !this.employee.TaxTable && !this.employee.TaxPercentage;

        return noBankAccounts || noTax;
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }
}
