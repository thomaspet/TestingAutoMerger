import { NumberFormat } from './../../../services/common/NumberFormatService';
import { Component, Input, OnChanges, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UniTable, UniTableColumnType, UniTableColumn, UniTableConfig, IDeleteButton, IContextMenuItem } from 'unitable-ng2/main';
import { UniHttp } from '../../../../framework/core/http/http';
import { Employee, AGAZone, WageType, PayrollRun, SalaryTransaction, SalaryTransactionSums, WageTypeSupplement, SalaryTransactionSupplement, GetRateFrom, Account } from '../../../unientities';
import { EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService, PayrollrunService, AccountService, ReportDefinitionService, UniCacheService } from '../../../services/services';
import { IUniSaveAction } from '../../../../framework/save/save';
import { ControlModal } from '../payrollrun/controlModal';
import { PostingsummaryModal } from '../payrollrun/postingsummaryModal';
import { UniForm } from '../../../../framework/uniform';
import { SalaryTransactionSupplementsModal } from '../modals/salaryTransactionSupplementsModal';
import { ErrorService } from '../../../services/common/ErrorService';
import { ISummaryConfig } from '../../common/summary/summary';
import { PreviewModal } from '../../reports/modals/preview/previewModal';

import { UniView } from '../../../../framework/core/uniView';
declare var _;

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html'
})

export class SalaryTransactionEmployeeList extends UniView implements OnChanges {
    private salarytransEmployeeTableConfig: UniTableConfig;
    private wagetypes: WageType[] = [];

    public config: any = {};

    @ViewChild(UniForm) public uniform: UniForm;
    @ViewChild(SalaryTransactionSupplementsModal) private supplementModal: SalaryTransactionSupplementsModal;

    private employeeID: number;
    @Input() private employee: Employee;

    private payrollRun: PayrollRun;
    private payrollRunID: number;

    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public salarytransListReady: EventEmitter<any> = new EventEmitter<any>(true);

    @ViewChild(UniTable) public table: UniTable;
    @ViewChild(PreviewModal) public previewModal: PreviewModal;

    private busy: boolean;
    private salaryTransactions: SalaryTransaction[];
    private filteredTranses: SalaryTransaction[];
    private deleteButton: IDeleteButton;

    constructor(
        private salarytransService: SalaryTransactionService,
        private router: Router,
        private route: ActivatedRoute,
        private numberFormat: NumberFormat,
        private _accountService: AccountService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private _reportDefinitionService: ReportDefinitionService
    ) {
        super(router.url, cacheService);

        this.deleteButton = {
            disableOnReadonlyRows: true,
            deleteHandler: (row) => {
                if (!row['IsRecurringPost'] && !row['_isEmpty']) {
                    this.onRowDeleted(row);
                    return true;
                } else {
                    return false;
                }
            }
        };

        route.params.subscribe((params) => {
            this.payrollRunID = +params['id'];
            super.updateCacheKey(router.url);

            const payrollRunSubject = super.getStateSubject('payrollRun');
            const wagetypesSubject = super.getStateSubject('wagetypes');
            const salaryTransactionsSubject = super.getStateSubject('salaryTransactions');

            wagetypesSubject.subscribe(wagetypes => {
                this.wagetypes = wagetypes;
            });
            payrollRunSubject.subscribe(payrollRun => {
                this.payrollRun = payrollRun;
                if (this.salarytransEmployeeTableConfig) {
                    let isOpenRun = this.payrollRun.StatusCode < 1;
                    this.setEditable(isOpenRun);
                    this.salarytransEmployeeTableConfig.setDeleteButton(isOpenRun ? this.deleteButton : false);
                }
            });

            salaryTransactionsSubject.subscribe(transes => {
                this.salaryTransactions = transes;
                this.filteredTranses = this.salaryTransactions.filter(x => this.employee && !x.Deleted && x.EmployeeID === this.employee.ID);
            });
            if (!this.salarytransEmployeeTableConfig) {
                this.busy = true;
                Observable.combineLatest(salaryTransactionsSubject, wagetypesSubject, payrollRunSubject).take(1).subscribe((response) => {
                    this.createTableConfig();
                    this.busy = false;
                });
            }
        });
    }

    public ngOnChanges() {
        if (this.employee) {
            this.employeeID = this.employee.ID;
            if (this.salaryTransactions) {
                this.filteredTranses = this.salaryTransactions.filter(x => !x.Deleted && x.EmployeeID === this.employee.ID);
            }
            if (this.salarytransEmployeeTableConfig) {
                this.salarytransEmployeeTableConfig.columns.find(x => x.field === '_Employment').editorOptions = {
                    resource: this.employee.Employments,
                    itemTemplate: (item) => {
                        return item ? item.ID + ' - ' + item.JobName : '';
                    }
                };
                this.salarytransEmployeeTableConfig = _.cloneDeep(this.salarytransEmployeeTableConfig); // Trigger change detection in unitable
            }
        } else {
            this.filteredTranses = [];
        }
    }

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
                resource: this.employee ? this.employee.Employments : null,
                itemTemplate: (item) => {
                    return item ? item.ID + ' - ' + item.JobName : '';
                }
            });

        var accountCol = new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return dataItem['Account'] || '';
            })
            .setEditorOptions({
                itemTemplate: (selectedItem: Account) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this._accountService.GetAll(`filter=contains(AccountName, '${searchValue}') or startswith(AccountNumber, '${searchValue}')&top50`).debounceTime(200);
                }
            });
        var payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                const wagetype: WageType = dataItem['_Wagetype'] || dataItem.Wagetype || this.wagetypes ? this.wagetypes.find(x => x.ID === dataItem.WageTypeID) : undefined;

                if (!wagetype) {
                    return;
                }
                if (wagetype.Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', UniTableColumnType.Number, false)
            .setTemplate((dataItem) => {
                if (dataItem.IsRecurringPost === undefined || dataItem.IsRecurringPost === null) {
                    return;
                }
                if (dataItem.IsRecurringPost) {
                    return 'Fast';
                } else {
                    return 'Variabel';
                }
            });

        var wageTypeCol = new UniTableColumn('_Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
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

        this.salarytransEmployeeTableConfig = new UniTableConfig(this.payrollRun ? this.payrollRun.StatusCode < 1 : true)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.openSuplementaryInformationModal(row);
                }
            }])
            .setColumns([
                wageTypeCol, wagetypenameCol, employmentidCol,
                fromdateCol, toDateCol, accountCol, amountCol, rateCol, sumCol,
                transtypeCol, payoutCol
            ])
            .setDeleteButton( this.payrollRun.StatusCode < 1 ? this.deleteButton : false )
            .setPageable(false)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                let rateObservable = null;

                if (event.field === '_Wagetype') {
                    this.mapWagetypeToTrans(row);
                    rateObservable = this.getRate(row);
                }

                if (event.field === '_Employment') {
                    const employment = row['_Employment'];
                    row['EmploymentID'] = (employment) ? employment.ID : null;
                    rateObservable = this.getRate(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === 'FromDate' && row['FromDate']) {
                    row['FromDate'] = this.fixTimezone(row['FromDate']);
                }

                if (event.field === 'ToDate' && row['ToDate']) {
                    row['ToDate'] = this.fixTimezone(row['ToDate']);
                }

                if (event.field === '_Account') {
                    this.mapAccountToTrans(row);
                }

                if (rateObservable) {
                    rateObservable.subscribe(rate => {
                        row['Rate'] = rate;
                        this.calcItem(row);
                        this.updateSalaryChanged(row);
                    });
                } else {
                    this.updateSalaryChanged(row);
                }

                return row;
            })
            .setIsRowReadOnly((rowModel: SalaryTransaction) => {
                return rowModel.IsRecurringPost;
            });
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['_Wagetype'];
        if (!wagetype) {
            return;
        }
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = this.fixTimezone(this.payrollRun.FromDate);
        rowModel['ToDate'] = this.fixTimezone(this.payrollRun.ToDate);
        rowModel['_BasePayment'] = wagetype.Base_Payment;

        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
        }
        if (this.employee) {
            let employment = this.employee.Employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['EmploymentID'] = employment.ID ? employment.ID : 0;
            }
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
    }

    private getRate(rowModel: SalaryTransaction) {
        return this.salarytransService.getRate(rowModel['WageTypeID'], rowModel['EmploymentID'], rowModel['EmployeeID']);
    }

    private mapAccountToTrans(rowModel: SalaryTransaction) {
        let account: Account = rowModel['_Account'];
        if (!account) {
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    private calcItem(rowModel) {
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        let amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        let ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        let sum = (Math.round((amountPrecision * rowModel['Amount'])) * Math.round((ratePrecision * rowModel['Rate']))) / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
    }

    private getEmploymentFromEmployee(employmentID: number) {
        if (this.employee.Employments && employmentID) {
            return this.employee.Employments.find(x => x.ID === employmentID);
        }

        return null;
    }

    public openSuplementaryInformationModal(row: SalaryTransaction) {
        this.supplementModal.openModal(row, this.payrollRun.StatusCode > 0);
    }

    public updateSingleSalaryTransaction(trans: SalaryTransaction) {
        if (trans) {
            let rows: SalaryTransaction[] = this.table.getTableData();
            let row: SalaryTransaction = rows.find(x => x.ID === trans.ID);
            if (row) {
                row.Supplements = trans.Supplements;
                this.updateSalaryChanged(row);
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
    }

    private onRowDeleted(row: SalaryTransaction) {
        let hasDirtyRow: boolean = true;

        let transIndex: number = this.getTransIndex(row);

        if (transIndex >= 0 && this.salaryTransactions[transIndex].ID) {
            this.salaryTransactions[transIndex].Deleted = true;
        } else {
            this.salaryTransactions.splice(transIndex, 1);
            hasDirtyRow = this.salaryTransactions.some(trans => trans['_isDirty']);
        }
    }
    
    public showPayList(done) {
        this._reportDefinitionService.getReportByName('Utbetalingsliste').subscribe((report) => {
            this.previewModal.openWithId(report, this.payrollRun.ID, 'RunID');
            done('');
        });
    }

    private updateSalaryChanged(row) {
        row['_isDirty'] = true;
        let transIndex = this.getTransIndex(row);

        if (transIndex !== -1) {
            this.salaryTransactions[transIndex] = row;
        } else {
            this.salaryTransactions.push(row);
        }

        this.table.updateRow(row['_originalIndex'], row);
        super.updateState('salaryTransactions', this.salaryTransactions, true);
    }

    private getTransIndex(row) {
        let transIndex = null;

        if (row['ID']) {
            transIndex = this.salaryTransactions.findIndex(x => x.ID === row.ID);
        } else {
            row['EmployeeID'] = this.employeeID;
            row['PayrollRunID'] = this.payrollRunID;
            row['IsRecurringPost'] = false;
            transIndex = this.salaryTransactions.findIndex(x => x['_originalIndex'] === row['_originalIndex'] && x.EmployeeID === this.employeeID);
        }

        return transIndex;
    }

    public hasDirty(): boolean {
        return this.filteredTranses && this.filteredTranses.some(x => x.Deleted || x['_isDirty']);
    }

    public setEditable(isEditable: boolean) {
        this.salarytransEmployeeTableConfig.setEditable(isEditable);
    }
}
