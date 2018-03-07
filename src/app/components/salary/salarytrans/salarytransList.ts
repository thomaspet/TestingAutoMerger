import {Component, Input, OnChanges, EventEmitter, Output, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {
    UniTableColumnType,
    UniTableColumn,
    UniTableConfig,
    IDeleteButton,
    ICellClickEvent
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    Employee, WageType, PayrollRun, SalaryTransaction, Project, Department,
    WageTypeSupplement, SalaryTransactionSupplement, Account, Dimensions, LocalDate, Valuetype
} from '../../../unientities';
import {
    AccountService, ReportDefinitionService, UniCacheService,
    ErrorService, NumberFormat, WageTypeService
} from '../../../services/services';
import {UniForm} from '../../../../framework/ui/uniform/index';

import {UniView} from '../../../../framework/core/uniView';
import {ImageModal, IUpdatedFileListEvent} from '../../common/modals/ImageModal';
import {UniModalService} from '../../../../framework/uniModal/barrel';
import {SalaryTransViewService} from '../sharedServices/salaryTransViewService';
declare var _;
const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: './salarytransList.html'
})

export class SalaryTransactionEmployeeList extends UniView implements OnChanges {
    @ViewChild(AgGridWrapper) public table: AgGridWrapper;
    @ViewChild(UniForm) public uniform: UniForm;

    @Input() private employee: Employee;

    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public salarytransListReady: EventEmitter<any> = new EventEmitter<any>(true);

    private salarytransEmployeeTableConfig: UniTableConfig;
    private wagetypes: WageType[] = [];
    private projects: Project[] = [];
    private departments: Department[] = [];

    public config: any = {};
    private employeeID: number;

    private payrollRun: PayrollRun;
    private payrollRunID: number;

    private busy: boolean;
    private salaryTransactions: SalaryTransaction[];
    private filteredTranses: SalaryTransaction[];
    private deleteButton: IDeleteButton;
    private refresh: boolean;

    constructor(
        private modalService: UniModalService,
        private wageTypeService: WageTypeService,
        private router: Router,
        private route: ActivatedRoute,
        private numberFormat: NumberFormat,
        private _accountService: AccountService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private _reportDefinitionService: ReportDefinitionService,
        private salaryTransViewService: SalaryTransViewService
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
            this.salaryTransactions = [];

            const payrollRunSubject = super.getStateSubject('payrollRun');
            const wagetypesSubject = super.getStateSubject('wagetypes');
            const salaryTransactionsSubject = super.getStateSubject('salaryTransactions');
            const projectSubject = super.getStateSubject('projects');
            const departmentSubject = super.getStateSubject('departments');

            wagetypesSubject.subscribe(wagetypes => {
                this.wagetypes = wagetypes;
            });

            projectSubject.subscribe(projects => {
                this.projects = projects;
            });

            departmentSubject.subscribe(departments => {
                this.departments = departments;
            });

            payrollRunSubject.subscribe(payrollRun => {
                this.payrollRun = payrollRun;
                if (this.salarytransEmployeeTableConfig) {
                    let isOpenRun = this.payrollRun ? this.payrollRun.StatusCode < 1 : false;
                    this.setEditable(isOpenRun);
                    this.salarytransEmployeeTableConfig.setDeleteButton(isOpenRun ? this.deleteButton : false);
                }
            });

            salaryTransactionsSubject.subscribe((transes: SalaryTransaction[]) => {
                if (!this.salaryTransactions
                    || !this.salaryTransactions.length
                    || this.refresh
                    || !transes.some(x => x['_isDirty'] || x.Deleted)) {
                    this.salaryTransactions = transes;
                    this.filteredTranses = this.salaryTransactions
                        .filter(x => this.employee && x.EmployeeID === this.employee.ID && !x.Deleted);
                    this.refresh = false;
                }
            });

            if (!this.salarytransEmployeeTableConfig) {
                this.busy = true;
                Observable.combineLatest(salaryTransactionsSubject, wagetypesSubject,
                    payrollRunSubject)
                    .take(1).subscribe((response) => {
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
                this.filteredTranses = this.salaryTransactions
                    .filter(x => !x.Deleted && x.EmployeeID === this.employee.ID);
            }
            if (this.salarytransEmployeeTableConfig) {
                this.salarytransEmployeeTableConfig.columns.find(x => x.field === 'employment').options = {
                    resource: this.employee.Employments,
                    itemTemplate: (item) => {
                        return item ? item.ID + ' - ' + item.JobName : '';
                    }
                };

                // Trigger change detection in unitable
                this.salarytransEmployeeTableConfig = _.cloneDeep(this.salarytransEmployeeTableConfig);
            }
        } else {
            this.filteredTranses = [];
        }
    }

    private createTableConfig() {
        let wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text).setWidth('9rem');
        let fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        let toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);
        let rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);
        let amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number).setWidth('5rem');
        let sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money, false);
        let employmentidCol = new UniTableColumn('employment', 'Arbeidsforhold', UniTableColumnType.Select)
            .setTemplate((dataItem) => {

                if (!dataItem['employment'] && !dataItem['EmploymentID']) {
                    return '';
                }

                let employment = dataItem['employment'] || this.getEmploymentFromEmployee(dataItem.EmploymentID);

                dataItem['employment'] = employment;

                return employment ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setOptions({
                resource: this.employee ? this.employee.Employments : null,
                itemTemplate: (item) => {
                    return item ? item.ID + ' - ' + item.JobName : '';
                }
            });

        let accountCol = new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return dataItem['Account'] || '';
            })
            .setOptions({
                itemTemplate: (selectedItem: Account) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this._accountService.GetAll(
                        `filter=contains(AccountName, '${searchValue}') `
                        + `or startswith(AccountNumber, '${searchValue}')&top50`
                    ).debounceTime(200);
                }
            })
            .setWidth('4rem');

        let projectCol = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setTemplate((rowModel: SalaryTransaction) => {

                let project = rowModel['_Project'];
                if (!rowModel['_isEmpty'] && project) {
                    return project.ProjectNumber + ' - ' + project.Name;
                }

                return '';
            })
            .setOptions({
                itemTemplate: (selectedItem: Project) => {
                    return (selectedItem.ProjectNumber + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.projects.filter((project: Project) => {
                        if (isNaN(searchValue)) {
                            return (project.Name.toLowerCase().indexOf(searchValue) > -1);
                        } else {
                            return (project.ProjectNumber.toString().startsWith(searchValue.toString()));
                        }
                    });
                }
            });

        let departmentCol = new UniTableColumn('_Department', 'Avdeling', UniTableColumnType.Lookup)
            .setTemplate((rowModel: SalaryTransaction) => {

                let department: Department = rowModel['_Department'];
                if (!rowModel['_isEmpty'] && department) {
                    return department.DepartmentNumber + ' - ' + department.Name;
                }

                return '';
            })
            .setOptions({
                itemTemplate: (selectedItem: Department) => {
                    return (selectedItem.DepartmentNumber + ' - ' + selectedItem.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.departments.filter((department: Department) => {
                        if (isNaN(searchValue)) {
                            return (department.Name.toLowerCase().indexOf(searchValue) > -1);
                        } else {
                            return (department.DepartmentNumber.toString().startsWith(searchValue.toString()));
                        }
                    });
                }
            });

        let payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                const wagetype: WageType = dataItem.Wagetype || this.wagetypes
                    ? this.wagetypes.find(x => x.ID === dataItem.WageTypeID)
                    : undefined;

                if (!wagetype) {
                    return;
                }
                if (wagetype.Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            })
            .setWidth('5.3rem');

        let wageTypeCol = new UniTableColumn('Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
            .setDisplayField('WageTypeNumber')
            .setOptions({
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
            })
            .setWidth('5rem');

        let fileCol = new UniTableColumn('_FileIDs', PAPERCLIP, UniTableColumnType.Text, false)
            .setTemplate(row => row['_FileIDs'] && row['_FileIDs'].length ? PAPERCLIP : '')
            .setWidth(32)
            .setResizeable(false)
            .setSkipOnEnterKeyNavigation(true);

        let supplementCol = this.salaryTransViewService
            .createSupplementsColumn(
                (trans) => this.onSupplementModalClose(trans),
                () => this.payrollRun && !!this.payrollRun.StatusCode);

        const editable = this.payrollRun ? this.payrollRun.StatusCode < 1 : true;
        this.salarytransEmployeeTableConfig = new UniTableConfig('salary.salarytrans.list', editable)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.salaryTransViewService
                        .openSupplements(
                            row,
                            (trans) => this.onSupplementModalClose(trans),
                            this.payrollRun && !!this.payrollRun.StatusCode);
                }
            },
            {
                label: 'Legg til dokument', action: (row) => {
                    this.openDocumentsOnRow(row);
                }
            }])
            .setColumns([
                wageTypeCol, wagetypenameCol, employmentidCol, fromdateCol, toDateCol, accountCol,
                amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol, supplementCol, fileCol
            ])
            .setAutoAddNewRow(true)
            .setColumnMenuVisible(true)
            .setDeleteButton(this.payrollRun ? (this.payrollRun.StatusCode < 1 ? this.deleteButton : false) : false)
            .setPageable(false)
            .setChangeCallback((event) => {
                let row = event.rowModel;
                let rateObservable = null;

                if (event.field === 'Wagetype') {
                    this.mapWagetypeToTrans(row);
                    if (row['Wagetype']) {
                        rateObservable = this.getRate(row);
                    }
                }

                if (event.field === 'employment') {
                    this.mapEmploymentToTrans(row);
                    rateObservable = this.getRate(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === '_Account') {
                    this.mapAccountToTrans(row);
                }

                if (event.field === '_Project') {
                    this.mapProjectToTrans(row);
                }

                if (event.field === '_Department') {
                    this.mapDepartmentToTrans(row);
                }

                if (event.field === 'FromDate' || event.field === 'ToDate') {
                    this.checkDates(row);
                }

                if (rateObservable) {
                    rateObservable.take(1).subscribe(rate => {
                        row['Rate'] = rate;
                        this.calcItem(row);
                        this.updateSalaryChanged(row, true);
                    });
                } else {
                    this.updateSalaryChanged(row);
                }

                return row;
            })
            .setIsRowReadOnly(
                (rowModel: SalaryTransaction) => {
                    return rowModel.IsRecurringPost
                        || !!rowModel.SalaryBalanceID
                        || !this.salarytransEmployeeTableConfig.editable;
                }
            );
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === '_FileIDs') {
            this.openDocumentsOnRow(event.row);
        }
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['Wagetype'];
        if (!wagetype) {
            rowModel['WageTypeID'] = null;
            rowModel['WageTypeNumber'] = null;
            return;
        }
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = this.payrollRun.FromDate;
        rowModel['ToDate'] = this.payrollRun.ToDate;
        rowModel['_BasePayment'] = wagetype.Base_Payment;

        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
        }
        if (this.employee) {
            let employment = this.employee.Employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['employment'] = employment;
                this.mapEmploymentToTrans(rowModel);
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
                const transSupplement = new SalaryTransactionSupplement();
                transSupplement.WageTypeSupplementID = supplement.ID;
                transSupplement.WageTypeSupplement = supplement;
                supplements.push(transSupplement);
            });
            rowModel['Supplements'] = supplements;
        }
    }

    private getRate(rowModel: SalaryTransaction) {
        return this.wageTypeService
            .getRate(rowModel['WageTypeID'], rowModel['EmploymentID'], rowModel['EmployeeID']);
    }

    private mapEmploymentToTrans(rowModel: SalaryTransaction) {
        const employment = rowModel['employment'];
        rowModel['EmploymentID'] = (employment) ? employment.ID : null;

        if (employment && employment.Dimensions) {
            let department = this.departments.find(x => x.ID === employment.Dimensions.DepartmentID);

            rowModel['_Department'] = department || rowModel['_Department'];

            let project = this.projects.find(x => x.ID === employment.Dimensions.ProjectID);
            rowModel['_Project'] = project || rowModel['_Project'];

            this.mapDepartmentToTrans(rowModel);
            this.mapProjectToTrans(rowModel);
        }
    }

    private mapAccountToTrans(rowModel: SalaryTransaction) {
        let account: Account = rowModel['_Account'];
        if (!account) {
            rowModel.Account = null;
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    private mapProjectToTrans(rowModel: SalaryTransaction) {
        let project = rowModel['_Project'];

        if (!rowModel.Dimensions) {
            rowModel.Dimensions = new Dimensions();
        }

        if (!project) {
            rowModel.Dimensions.ProjectID = null;
            return;
        }

        rowModel.Dimensions.ProjectID = project.ID;
    }

    private mapDepartmentToTrans(rowModel: SalaryTransaction) {
        let department: Department = rowModel['_Department'];

        if (!rowModel.Dimensions) {
            rowModel.Dimensions = new Dimensions();
        }

        if (!department) {
            rowModel.Dimensions.DepartmentID = null;
            return;
        }

        rowModel.Dimensions.DepartmentID = department.ID;
    }

    private calcItem(rowModel) {
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        let amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        let ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        let sum =
            (Math.round((amountPrecision * rowModel['Amount'])) * Math.round((ratePrecision * rowModel['Rate'])))
            / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
    }

    private checkDates(rowModel) {
        let fromDate: LocalDate = new LocalDate(rowModel['FromDate'].toString());
        let toDate: LocalDate = new LocalDate(rowModel['ToDate'].toString());
        if (toDate < fromDate) {
            rowModel['ToDate'] = fromDate.toString();
        }
    }

    private getEmploymentFromEmployee(employmentID: number) {
        if (this.employee && this.employee.Employments && employmentID) {
            return this.employee.Employments.find(x => x.ID === employmentID);
        }

        return null;
    }

    private onSupplementModalClose(trans: SalaryTransaction) {
        if (trans && trans.Supplements && trans.Supplements.length) {
            this.updateSalaryChanged(trans, true);
        }
    }

    public updateSingleSalaryTransaction(trans: SalaryTransaction) {
        if (trans) {
            let rows: SalaryTransaction[] = this.table.getTableData();
            let row: SalaryTransaction = rows.find(x => x.ID === trans.ID);
            if (row) {
                row.Supplements = trans.Supplements;
                this.updateSalaryChanged(row, true);
            }
        }
    }

    public rowChanged(event) {
        let row: SalaryTransaction = event.rowModel;

        if (!row.DimensionsID && !row.Dimensions) {
            row.Dimensions = new Dimensions();
        }
    }

    private onRowDeleted(row: SalaryTransaction) {
        let hasDirtyRow: boolean = true;

        let transIndex: number = this.getTransIndex(row);
        if (transIndex >= 0) {
            if (this.salaryTransactions[transIndex].ID) {
                this.salaryTransactions[transIndex].Deleted = true;
            } else {
                this.salaryTransactions.splice(transIndex, 1);
                hasDirtyRow = this.salaryTransactions.some(trans => trans['_isDirty'] || trans['Deleted']);
            }

            this.refresh = true;
            super.updateState('salaryTransactions', this.salaryTransactions, hasDirtyRow);
        }
    }

    private updateSalaryChanged(row, updateTable = false) {
        row['_isDirty'] = true;
        let transIndex = this.getTransIndex(row);

        if (transIndex !== -1) {
            this.salaryTransactions[transIndex] = row;
        } else {
            this.salaryTransactions.push(row);
        }
        if (updateTable) {
            this.table.updateRow(row['_originalIndex'], row);
        }
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
            transIndex = this.salaryTransactions.findIndex(
                x => x['_guid'] === row['_guid'] && x.EmployeeID === this.employeeID
            );
        }

        return transIndex;
    }

    private openDocumentsOnRow(row: SalaryTransaction): void {
        if (row.ID) {
            let data = {
                entity: SalaryTransaction.EntityType,
                entityID: row.ID,
                fileIDs: row['_FileIDs'] || []
            };

            this.modalService.open(ImageModal, {data: data}).onClose.subscribe((list: IUpdatedFileListEvent) => {
                this.updateFileList(list);
            });
        }
    }

    public hasDirty(): boolean {
        return this.salaryTransactions
            && this.salaryTransactions
                .filter(x => x.EmployeeID === this.employeeID)
                .some(x => x.Deleted || x['_isDirty']);
    }

    public setEditable(isEditable: boolean) {
        this.salarytransEmployeeTableConfig.setEditable(isEditable);
    }

    public updateFileList(event: IUpdatedFileListEvent) {
        let update: boolean;
        this.salaryTransactions.forEach((trans) => {
            if (!event || trans.ID !== event.entityID || trans['_FileIDs'].length === event.files.length) {
                return;
            }

            trans['_FileIDs'] = event.files.map(file => file.ID);
            this.table.updateRow(
                this.filteredTranses.find(filteredTrans => filteredTrans.ID === trans.ID)['_originalIndex'],
                trans);

            if (!this.payrollRun.JournalEntryNumber) {
                return;
            }

            trans['_newFiles'] = event.files
                .filter(file => !trans['Files'].some(transFile => transFile.ID === file.ID));
            update = trans['_newFiles'].length;
        });

        if (update) {
            super.updateState('salaryTransactions', this.salaryTransactions, this.salaryTransactions
                .some(x => x['_isDirty'] || x.Deleted));
        }
    }
}
