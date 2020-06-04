import {Component, Input, OnChanges, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Observable, Subject, forkJoin} from 'rxjs';
import {
    UniTableColumnType,
    UniTableColumn,
    UniTableConfig,
    IDeleteButton,
    ICellClickEvent
} from '@uni-framework/ui/unitable/index';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import {
    WageType, PayrollRun, SalaryTransaction, Project, Department,
    WageTypeSupplement, SalaryTransactionSupplement, Account, Dimensions, LocalDate, Valuetype, StdSystemType
} from '@uni-entities';
import {
    AccountService, UniCacheService,
    ErrorService, WageTypeService, SalaryTransactionService, IEmployee
} from '@app/services/services';

import {tap, takeUntil, map} from 'rxjs/operators';
import { UniView } from '@uni-framework/core/uniView';
import { UniModalService } from '@uni-framework/uni-modal';
import { SalaryTransactionViewService } from '@app/components/salary/shared/services/salary-transaction/salary-transaction-view.service';
import { IUpdatedFileListEvent, ImageModal } from '@app/components/common/modals/ImageModal';
import { SalaryTransactionSuggestedValuesService } from '@app/components/salary/shared/services/salary-transaction/salary-transaction-suggested-values.service';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip
const BUSY_KEY = 'transes_busy';
const SALARY_TRANS_KEY: string = 'salaryTransactions';
const DIRTY_FLAG: string = '_isDirty';
const PROJECT_FIELD: string = '_Project';
const DEPARTMENT_FIELD: string = '_Department';

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: './salary-transaction-list.component.html'
})

export class SalaryTransactionListComponent extends UniView implements OnChanges, OnInit, OnDestroy {
    @ViewChild(AgGridWrapper, { static: true }) public table: AgGridWrapper;

    @Input() private employee: IEmployee;

    private destroy$: Subject<any> = new Subject();

    public salarytransEmployeeTableConfig: UniTableConfig;
    private wagetypes: WageType[] = [];
    private projects: Project[] = [];
    private departments: Department[] = [];

    private employeeID: number;

    private payrollRun: PayrollRun;
    private payrollRunID: number;

    public busy: boolean;
    private salaryTransactions: SalaryTransaction[];
    public filteredTranses: SalaryTransaction[];
    private refresh: boolean;

    constructor(
        private modalService: UniModalService,
        private wageTypeService: WageTypeService,
        private router: Router,
        private route: ActivatedRoute,
        private _accountService: AccountService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private salaryTransViewService: SalaryTransactionViewService,
        private salaryTransService: SalaryTransactionService,
        private salaryTransSuggestedValues: SalaryTransactionSuggestedValuesService,
    ) {
        super(router.url, cacheService);
    }

    public ngOnInit() {
        this.route.params.subscribe((params) => {
            this.payrollRunID = +params['id'];
            super.updateCacheKey(this.router.url);
            this.salaryTransactions = [];

            const payrollRunSubject = super.getStateSubject('payrollRun').takeUntil(this.destroy$);
            const wagetypesSubject = super.getStateSubject('wagetypes').takeUntil(this.destroy$);
            const salaryTransactionsSubject = super.getStateSubject(SALARY_TRANS_KEY).takeUntil(this.destroy$);
            const projectSubject = super.getStateSubject('projects').takeUntil(this.destroy$);
            const departmentSubject = super.getStateSubject('departments').takeUntil(this.destroy$);

            this.wageTypeService.getOrderByWageTypeNumber('').subscribe(wagetypes => {
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
                    const isOpenRun = this.payrollRun ? this.payrollRun.StatusCode < 1 : false;
                    this.setEditable(isOpenRun);
                }
            });

            salaryTransactionsSubject.subscribe((transes: SalaryTransaction[]) => {
                if (!this.salaryTransactions
                    || !this.salaryTransactions.length
                    || !this.filteredTranses.length
                    || this.refresh
                    || !transes.some(x => x['_isDirty'] || x.Deleted)) {
                    this.salaryTransactions = transes;
                    this.filteredTranses = this.salaryTransactions
                        .filter(x => this.employee && x.EmployeeID === this.employee.ID && !x.Deleted);

                    this.refresh = false;
                }
            });

            if (!this.salarytransEmployeeTableConfig) {
                super.updateState(BUSY_KEY, true, false);
                Observable.combineLatest(salaryTransactionsSubject, wagetypesSubject, payrollRunSubject)
                .take(1).subscribe((response) => {
                    this.createTableConfig();
                    super.updateState(BUSY_KEY, false, false);
                });
            }
        });
        super.getStateSubject(BUSY_KEY)
            .pipe(
                tap(busy => this.busy = busy),
                takeUntil(this.destroy$)
            )
            .subscribe();
    }

    public ngOnChanges() {
        if (this.employee) {
            this.employeeID = this.employee.ID;
            if (this.salaryTransactions) {
                this.filteredTranses = this.salaryTransactions
                    .filter(x => !x.Deleted && x.EmployeeID === this.employee.ID);
            }
        } else {
            this.filteredTranses = [];
        }
    }

    public ngOnDestroy() {
        this.destroy$.next();
    }

    private createTableConfig() {
        const wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text).setWidth('9rem');
        const fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate);
        const toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate);
        const rateCol = new UniTableColumn(
            'Rate',
            'Sats',
            UniTableColumnType.Money,
            (row: SalaryTransaction) => !row.Wagetype || !row.Wagetype.DaysOnBoard);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number).setWidth('5rem');
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money, false);
        const employmentidCol = new UniTableColumn('employment', 'Arbeidsforhold', UniTableColumnType.Select)
            .setTemplate((dataItem) => {

                if (!dataItem['employment'] && !dataItem['EmploymentID']) {
                    return '';
                }

                const employment = dataItem['employment'] || this.getEmploymentFromEmployee(dataItem.EmploymentID);

                dataItem['employment'] = employment;

                return employment ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setOptions({
                resource: (row) => this.employee && this.employee.Employments,
                itemTemplate: (item) => {
                    return item ? item.ID + ' - ' + item.JobName : '';
                }
            });

        const accountCol = new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup)
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

        const vatTypeCol = this.salaryTransViewService.createVatTypeColumn();

        const projectCol = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setTemplate((rowModel: SalaryTransaction) => {

                const project = rowModel['_Project'];
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

        const departmentCol = new UniTableColumn('_Department', 'Avdeling', UniTableColumnType.Lookup)
            .setTemplate((rowModel: SalaryTransaction) => {

                const department: Department = rowModel['_Department'];
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

        const payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                const wagetype: WageType = dataItem.Wagetype || (this.wagetypes && this.wagetypes.find(x => x.ID === dataItem.WageTypeID));

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

        const wageTypeCol = new UniTableColumn('Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
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

        const fileCol = new UniTableColumn('_FileIDs', PAPERCLIP, UniTableColumnType.Text, false)
            .setTemplate(row => row['_FileIDs'] && row['_FileIDs'].length ? PAPERCLIP : '')
            .setWidth(32)
            .setResizeable(false)
            .setSkipOnEnterKeyNavigation(true);

        const supplementCol = this.salaryTransViewService
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
                    label: 'Legg til dokument',
                    action: (row) => {
                        this.openDocumentsOnRow(row);
                    }
                },
                {
                    label: 'Slett post',
                    action: (row) => {
                        this.onRowDeleted(row);
                    },
                    disabled: (row: SalaryTransaction) =>
                        !this.payrollRun || this.payrollRun.StatusCode >= 1 || !!row['_isReadOnly'] || row['_isEmpty']
                }
            ])
            .setColumns([
                wageTypeCol, wagetypenameCol, employmentidCol, fromdateCol, toDateCol, accountCol, vatTypeCol,
                amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol, supplementCol, fileCol
            ])
            .setAutoAddNewRow(true)
            .setColumnMenuVisible(true)
            .setDeleteButton(false)
            .setPageable(false)
            .setChangeCallback((event) => {
                const row: SalaryTransaction = event.rowModel;
                let suggestions$: Observable<SalaryTransaction[]> = null;

                if (event.field === 'Wagetype') {
                    this.mapWagetypeToTrans(row);
                    this.mapVatToTrans(row);
                }

                if (event.field === 'employment') {
                    this.salaryTransViewService.mapEmploymentToTrans(row, this.departments, this.projects);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === 'VatType') {
                    row.VatTypeID = row.VatType && row.VatType.ID;
                }

                if (event.field === '_Account') {
                    this.mapAccountToTrans(row);
                    this.mapVatToTrans(row);
                }

                if (event.field === '_Project') {
                    this.salaryTransViewService.mapProjectToTrans(row);
                }

                if (event.field === '_Department') {
                    this.salaryTransViewService.mapDepartmentToTrans(row);
                }

                if (event.field === 'FromDate' || event.field === 'ToDate') {
                    this.checkDates(row);
                }

                if ((event.field === 'Wagetype' || event.field === 'employment')) {
                    suggestions$ = suggestions$
                        ? suggestions$.switchMap( rows => this.fillInAll(rows))
                        : this.fillIn(row);
                }

                if (event.field === '_Account' || event.field === 'Wagetype') {
                    suggestions$ = suggestions$
                        ? suggestions$.switchMap(trans => this.suggestVatTypes(trans))
                        : this.suggestVatTypes([row]);
                }

                if (suggestions$) {
                    suggestions$
                        .take(1)
                        .pipe(
                            map((transes: SalaryTransaction[]) => this.calcItems(transes)),
                        )
                        .subscribe((transes: SalaryTransaction[]) => this.updateTransStateBasedOnChanges(transes, true));
                } else {
                    this.updateTransStateBasedOnChange(row);
                }

                return row;
            })
            .setIsRowReadOnly(
                (rowModel: SalaryTransaction) => {
                    return rowModel.IsRecurringPost
                        || rowModel.SystemType === StdSystemType.HolidayPayDeduction
                        || !this.salarytransEmployeeTableConfig.editable
                        || !!rowModel['_isReadOnly'];
                }
            );
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === '_FileIDs') {
            this.openDocumentsOnRow(event.row);
        }
    }

    private suggestVatTypes(transes: SalaryTransaction[]): Observable<SalaryTransaction[]> {
        return forkJoin(transes.map(trans => this.suggestSingleVatType(trans)));
    }

    private suggestSingleVatType(trans: SalaryTransaction): Observable<SalaryTransaction> {
        return this.salaryTransSuggestedValues
            .suggestVatType(trans)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private mapWagetypeToTrans(rowModel) {
        const wagetype: WageType = rowModel['Wagetype'];
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
            const employment = this.employee.Employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['employment'] = employment;
                this.salaryTransViewService.mapEmploymentToTrans(rowModel, this.departments, this.projects);
            }
        }

        const supplements: SalaryTransactionSupplement[] = [];

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

    private fillInAll(rowModels: SalaryTransaction[]): Observable<SalaryTransaction[]> {
        return forkJoin(rowModels.map(rowModel => this.fillIn(rowModel)))
            .pipe(
                map(transResult => transResult.reduce((acc, curr) => [...acc, ...curr], [])),
            );
    }

    private fillIn(rowModel: SalaryTransaction): Observable<SalaryTransaction[]> {
        const index = this.getTransIndex(rowModel);
        rowModel.PayrollRunID = rowModel.PayrollRunID || this.payrollRunID;
        rowModel.EmployeeID = rowModel.EmployeeID || this.employeeID;
        return this.salaryTransService
            .completeTrans(rowModel)
            .pipe(
                map(transes => {
                    transes.forEach(trans => this.transferFrontendFieldsAndMarkDirty(rowModel, trans));
                    return index < 0
                    ? [...transes]
                    : [this.salaryTransService.fillInRowmodel(rowModel, transes[0])
                        , ...transes.slice(1)];

                })
            );
    }

    private transferFrontendFieldsAndMarkDirty(from: SalaryTransaction, to: SalaryTransaction): void {
        to[DIRTY_FLAG] = true;
        to[PROJECT_FIELD] = from[PROJECT_FIELD];
        to[DEPARTMENT_FIELD] = from[DEPARTMENT_FIELD];
        this.refresh = true;
    }

    private mapAccountToTrans(rowModel: SalaryTransaction): void {
        const account: Account = rowModel['_Account'];
        if (!account) {
            rowModel.Account = null;
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    private mapVatToTrans(rowModel: SalaryTransaction) {
        const account: Account = rowModel['_Account'];

        if (account != null && account.VatType != null) {
            rowModel.VatType = account.VatType;
            rowModel.VatTypeID = account.VatType.ID;
        } else {
            rowModel.VatType = null;
            rowModel.VatTypeID = null;
        }
    }

    private calcItem(rowModel: SalaryTransaction): SalaryTransaction {
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        const amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        const ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        const sum =
            (Math.round((amountPrecision * rowModel['Amount'])) * Math.round((ratePrecision * rowModel['Rate'])))
            / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
        return rowModel;
    }

    private calcItems(rowModels: SalaryTransaction[]): SalaryTransaction[] {
        rowModels.forEach(rowModel => this.calcItem(rowModel));
        return rowModels;
    }

    private checkDates(rowModel) {
        const fromDate: LocalDate = new LocalDate(rowModel['FromDate'].toString());
        const toDate: LocalDate = new LocalDate(rowModel['ToDate'].toString());
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

    public onSupplementModalClose(trans: SalaryTransaction) {
        if (trans && trans.Supplements && trans.Supplements.length) {
            trans[DIRTY_FLAG] = true;
            this.updateTransStateBasedOnChange(trans, true);
        }
    }

    public rowChanged(event) {
        const row: SalaryTransaction = event.rowModel;

        if (!row.DimensionsID && !row.Dimensions) {
            row.Dimensions = new Dimensions();
        }
    }

    public onRowDeleted(row: SalaryTransaction) {
        let hasDirtyRow: boolean = true;

        const transIndex: number = this.getTransIndex(row);
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

    private updateTransStateBasedOnChange(row: SalaryTransaction, updateTable = false) {
        this.updateTransStateBasedOnChanges([row], updateTable);
    }

    private updateTransStateBasedOnChanges(rows: SalaryTransaction[], updateTable = false) {
        rows.forEach(row => {
            const transIndex = this.getTransIndex(row);

            if (transIndex !== -1) {
                this.salaryTransactions[transIndex] = row;
            } else {
                this.salaryTransactions.push(row);
            }
            if (updateTable && (transIndex < 0)) {
                this.refresh = true;
            }
        });
        super.updateState(SALARY_TRANS_KEY, this.salaryTransactions, true);
    }

    private getTransIndex(row: SalaryTransaction) {
        let transIndex = -1;

        if (row['ID']) {
            transIndex = this.salaryTransactions.findIndex(x => x.ID === row.ID);
        } else {
            row.EmployeeID = row.EmployeeID || this.employeeID;
            row.PayrollRunID = row.PayrollRunID || this.payrollRunID;
            row.IsRecurringPost = false;

            if (row['_guid']) {
                transIndex = this.salaryTransactions.findIndex(
                    x => x['_guid'] === row['_guid'] && x.EmployeeID === this.employeeID
                );
            }

        }

        return transIndex;
    }

    private openDocumentsOnRow(row: SalaryTransaction): void {
        if (row.ID) {
            const data = {
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
        if (!this.salarytransEmployeeTableConfig) {
            return;
        }
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
