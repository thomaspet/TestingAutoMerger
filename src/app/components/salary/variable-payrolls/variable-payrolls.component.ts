import { Component, ViewChild } from '@angular/core';
import { UniTableColumnType, UniTableColumn, UniTableConfig, IDeleteButton } from '@uni-framework/ui/unitable';
import { Observable, Subject } from 'rxjs';
import { IUniSaveAction } from '@uni-framework/save/save';
import {
    Employee, WageType, PayrollRun, SalaryTransaction, Project, Department,
    WageTypeSupplement, SalaryTransactionSupplement, Account, Dimensions, LocalDate, Employment,
} from '../../../unientities';
import {
    UniCacheService,
    ErrorService,
    WageTypeService,
    AccountService,
    SalaryTransactionService,
    SalaryTransactionSuggestedValuesService,
    PayrollrunService,
    ProjectService,
    DepartmentService,
} from '@app/services/services';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniModalService, ConfirmActions } from '@uni-framework/uni-modal';
import { SalaryTransViewService } from '../sharedServices/salaryTransViewService';
import { ICellClickEvent } from '@uni-framework/ui/ag-grid/interfaces';
import { IUpdatedFileListEvent, ImageModal } from '@app/components/common/modals/ImageModal';
import { ActivatedRoute, Router } from '@angular/router';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ISelectConfig } from '@uni-framework/ui/uniform';
import { IUniInfoConfig } from '@app/components/common/uniInfo/uniInfo';
import { switchMap } from 'rxjs/operators';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip
declare var _;

@Component({
    selector: 'uni-variable-payrolls',
    templateUrl: './variable-payrolls.component.html',
    styleUrls: ['./variable-payrolls.component.sass']
})
export class VariablePayrollsComponent {
    @ViewChild(AgGridWrapper) public table: AgGridWrapper;
    public saveActions: IUniSaveAction[] = [];
    public salarytransSelectionTableConfig: UniTableConfig;
    public employeeList: Employee[] = [];
    private payrollRunID: number;
    public payrollruns: PayrollRun[] = [];
    public selectedPayrollrun: PayrollRun;
    public salarytransEmployeeTableConfig: UniTableConfig;
    private wagetypes: WageType[] = [];
    private projects: Project[] = [];
    private departments: Department[] = [];
    private deleteButton: IDeleteButton;
    public toggle: boolean = false;
    private newOrChangedSalaryTransactions: SalaryTransaction[] = [];
    public filteredTransactions: SalaryTransaction[] = [];
    private deletedLines: SalaryTransaction[] = [];
    public salaryTransactions: SalaryTransaction[] = null;
    public payrollrun$: Subject<boolean> = new Subject();
    public loading: boolean = true;
    public infoMessage: string = 'Viser alle registrerte variable lønnsposter på denne lønnsavregningen';
    public payrollrunSelectConfig: ISelectConfig;
    public infoConfig: IUniInfoConfig = {headline: 'Variable lønnsposter'};

    constructor(
        private modalService: UniModalService,
        private _accountService: AccountService,
        protected cacheService: UniCacheService,
        private errorService: ErrorService,
        private salaryTransViewService: SalaryTransViewService,
        private salaryTransService: SalaryTransactionService,
        private salaryTransSuggestedValues: SalaryTransactionSuggestedValuesService,
        private payrollrunService: PayrollrunService,
        private projectService: ProjectService,
        private departmentService: DepartmentService,
        private wageTypeService: WageTypeService,
        private route: ActivatedRoute,
        private router: Router,
        private tabService: TabService,
    ) {
        this.tabService.addTab(
            {
                name: 'Variable lønnsposter',
                url: 'salary/variablepayrolls',
                moduleID: UniModules.VariablePayrolls,
                active: true
            }
        );

        this.payrollrunSelectConfig = {
            displayProperty: 'Description',
            searchable: false,
            hideDeleteButton: true,
        };

        this.deleteButton = {
            deleteHandler: (row: SalaryTransaction) => {
                if (!row['_isEmpty']) {
                    this.onRowDeleted(row);
                    return true;
                } else {
                    return false;
                }
            }
        };

        this.route.params.subscribe(params => {
            this.payrollRunID = parseInt(params['id'], 10);

            if (this.payrollruns && this.payrollruns[0]) {
                this.loading = true;
                this.getsalaryTransBasedOnPayrollrun(this.payrollRunID);
            }
        });

        this.payrollrunService.getAll('filter=StatusCode eq 0 or StatusCode eq null').subscribe((payrollruns) => {
            if (payrollruns[0]) {
                this.payrollrun$.next(!!payrollruns[0]);
                this.payrollRunID = this.payrollRunID || payrollruns[0].ID;
                this.payrollruns = payrollruns;
                this.selectedPayrollrun = payrollruns.find((payrollrun) => payrollrun.ID === this.payrollRunID);

                Observable.forkJoin(
                    this.projectService.GetAll(''),
                    this.departmentService.GetAll(''),
                    this.wageTypeService.GetAll(null, ['SupplementaryInformations']),
                    this.payrollrunService.getEmployeesOnPayroll(
                        this.payrollRunID, ['Employments', 'BusinessRelationInfo', 'Employments.Dimensions']
                    ),
                    this.salaryTransService.GetAll(
                        'filter=' + `PayrollRunID eq ${this.payrollRunID} and IsRecurringPost eq ${false} and SalaryBalanceID eq ${null}`
                        + '&orderBy=IsRecurringPost DESC,SalaryBalanceID DESC,SystemType DESC',
                        ['WageType.SupplementaryInformations', 'employment', 'Supplements',
                        'Dimensions', 'Files', 'VatType.VatTypePercentages']
                    ),
                ).subscribe(([projects, departments, wageTypes, employees, salaryTranses]) => {
                    this.projects = projects;
                    this.departments = departments;
                    this.wagetypes = wageTypes;
                    this.employeeList = employees;
                    this.filteredTransactions = [];
                    this.setPropertiesOnSalaryTranses(salaryTranses);

                    this.router.navigateByUrl('salary/variablepayrolls/' + this.payrollRunID);
                    this.getSaveActions();
                    this.createTableConfig();
                }, err => this.errorService.handle(err));
            }
            this.loading = false;
        }, err => this.errorService.handle(err));
    }

    private getSaveActions(): IUniSaveAction[] {
        return this.saveActions = [
            {
                label: 'Lagre endringer',
                action: this.saveVariablePayrolls.bind(this),
                main: true,
                disabled: !(this.filteredTransactions.filter(x => x['_isDirty'] === true)[0])
            },
        ];
    }

    private saveVariablePayrolls(done: (message: string) => void) {
        const createguidOnDimensionsAndSupplements = this.newOrChangedSalaryTransactions.map(trans => {
            if (trans.Dimensions) {
                trans.Dimensions._createguid = this.payrollrunService.getNewGuid();
            }
            if (trans.Supplements) {
                trans.Supplements.map(x => x._createguid = this.payrollrunService.getNewGuid());
            }

            return trans;
        });

        this.loading = true;
        this.selectedPayrollrun.transactions = [...createguidOnDimensionsAndSupplements, ...this.deletedLines];

        this.payrollrunService.savePayrollRun(this.selectedPayrollrun).subscribe(payrollrun => {
            this.salaryTransService.invalidateCache();
            this.getSaveActions();

            this.getsalaryTransBasedOnPayrollrun(payrollrun.ID, true);
            done('Lagring vellykket');
        }, err => {
            this.loading = false;
            done('Lagring feilet');
            this.errorService.handle(err);
        });
    }

    public toggleChange(event) {
        this.toggle = event.checked;
        this.newOrChangedSalaryTransactions = this.newOrChangedSalaryTransactions.filter(trans => !trans['_isEmpty']);
        if (event.checked) {
            this.salaryTransactions = this.salaryTransactions.filter(trans => !trans['_isEmpty']);
            this.filteredTransactions = this.salaryTransactions.concat(this.newOrChangedSalaryTransactions);
        } else {
            this.filteredTransactions = this.newOrChangedSalaryTransactions;
        }
    }

    public canDeactivate(): Observable<boolean> {
        if (!(this.filteredTransactions.filter(x => x['_isDirty'])[0])) {
            return Observable.of(true);
        }

        return this.modalService
            .openUnsavedChangesModal()
            .onClose
            .map(result => {
                if (result === ConfirmActions.ACCEPT) {
                    this.saveVariablePayrolls(() => '');
                } else if (result === ConfirmActions.REJECT) {
                    this.filteredTransactions = [];
                } else if (result === ConfirmActions.CANCEL) {
                    this.selectedPayrollrun = this.payrollruns.filter((payrollrun) => payrollrun.ID === this.payrollRunID)[0];
                }

                return result !== ConfirmActions.CANCEL;
            });
    }

    private getsalaryTransBasedOnPayrollrun(payrollrunID: number, samePayrollRun?: boolean) {
        this.payrollRunID = payrollrunID;
        this.newOrChangedSalaryTransactions = [];

        if (!samePayrollRun) {
            this.payrollrunService.getEmployeesOnPayroll(
                this.payrollRunID, ['Employments', 'BusinessRelationInfo', 'Employments.Dimensions']
            ).subscribe(employees => this.employeeList = employees, err => this.errorService.handle(err));
        }

        return this.salaryTransService.GetAll(
            'filter=' + `PayrollRunID eq ${payrollrunID} and IsRecurringPost eq ${false} and SalaryBalanceID eq ${null}`
            + '&orderBy=IsRecurringPost DESC,SalaryBalanceID DESC,SystemType DESC',
            ['WageType.SupplementaryInformations', 'employment', 'Supplements', 'Dimensions', 'Files', 'VatType.VatTypePercentages']
        ).subscribe((salaryTranses) => {
            this.setPropertiesOnSalaryTranses(salaryTranses);

            if (this.toggle) {
                this.filteredTransactions = this.salaryTransactions;
            } else {
                this.filteredTransactions = [];
            }

            if (this.deletedLines && this.deletedLines[0]) {
                this.filteredTransactions.map(trans => {
                    const deletedLine = this.deletedLines.filter(x => x.ID === trans.ID)[0];

                    if (deletedLine) {
                        this.filteredTransactions = this.filteredTransactions.filter(filteredTrans => filteredTrans.ID !== deletedLine.ID);
                    }
                });
            }

            this.loading = false;
            this.deletedLines = [];
            this.createTableConfig();
        }, err => { this.loading = false; return this.errorService.handle(err); });
    }

    public onPayrollrunSelect(event) {
        if (event.ID) {
            this.router.navigateByUrl('/salary/variablepayrolls/' + event.ID);
        }
    }

    setPropertiesOnSalaryTranses(salaryTrans: SalaryTransaction[]) {
        this.salaryTransactions = salaryTrans.map(trans => {
            const employee = this.employeeList.find(emp => emp.ID === trans.EmployeeID);

            if (trans.Dimensions && trans.Dimensions.ProjectID) {
                trans['_Project'] = this.projects.find(project => project.ID === trans.Dimensions.ProjectID);
            }

            if (trans.Dimensions && trans.Dimensions.DepartmentID) {
                trans['_Department'] = this.departments.find(department => department.ID === trans.Dimensions.DepartmentID);
            }

            trans['_employee'] = employee;
            return trans;
        });
    }

    private createTableConfig() {
        const employeeCol = new UniTableColumn('_employee', 'Ansatt', UniTableColumnType.Lookup)
            .setTemplate(rowModel => {
                const employee = rowModel['_employee'];
                if (!rowModel['_isEmpty'] && employee) {
                    return employee.EmployeeNumber + ' - ' + employee.BusinessRelationInfo.Name;
                }

                return '';
            })
            .setOptions({
                itemTemplate: (selectedItem: Employee) => {
                    return (selectedItem.EmployeeNumber + ' - ' + selectedItem.BusinessRelationInfo.Name);
                },
                lookupFunction: (searchValue) => {
                    return this.employeeList.filter((employee: Employee) => {
                        if (isNaN(searchValue)) {
                            return (employee.BusinessRelationInfo.Name.toLowerCase().indexOf(searchValue) > -1);
                        } else {
                            return (employee.EmployeeNumber.toString().startsWith(searchValue.toString()));
                        }
                    });
                }
            });
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

                const employment = dataItem['employment'];

                dataItem['employment'] = employment;

                return employment ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setOptions({
                resource: (row) => {
                    if (row['_employee']) {
                        return row['_employee'].Employments || [];
                    }
                    return [];
                },
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
                () => this.selectedPayrollrun && !!this.selectedPayrollrun.StatusCode);

        const editable = true;
        this.salarytransEmployeeTableConfig = new UniTableConfig('salary.salarytrans.list', editable)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.salaryTransViewService
                        .openSupplements(
                            row,
                            (trans) => this.onSupplementModalClose(trans),
                            this.selectedPayrollrun && !!this.selectedPayrollrun.StatusCode);
                }
            },
            {
                label: 'Legg til dokument', action: (row) => {
                    this.openDocumentsOnRow(row);
                }
            }])
            .setColumns([
                employeeCol, wageTypeCol, wagetypenameCol, employmentidCol, fromdateCol, toDateCol, accountCol, vatTypeCol,
                amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol, supplementCol, fileCol
            ])
            .setAutoAddNewRow(true)
            .setColumnMenuVisible(true)
            .setDeleteButton(true, true)
            .setPageable(false)
            .setCopyFromCellAbove(false)
            .setChangeCallback((event) => {
                const row: SalaryTransaction = event.rowModel;
                let obs: Observable<SalaryTransaction> = null;

                if (event.field === '_employee') {
                    if (row['_employee']) {
                        row.EmployeeID = row['_employee'].ID;
                        row.employment = row['_employee'].Employments.find((e: Employment) => e.Standard);
                        this.mapEmploymentToTrans(row);
                    }
                }

                if (event.field === 'Wagetype') {
                    this.mapWagetypeToTrans(row);
                    this.mapVatToTrans(row);
                }

                if (event.field === 'employment') {
                    this.mapEmploymentToTrans(row);
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
                    obs = this.suggestVatType(row);
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

                if ((event.field === 'Wagetype' || event.field === 'employment')) {
                    obs = obs ? obs.switchMap(this.fillIn) : this.fillIn(row);
                }

                if (event.field === '_Account' || event.field === 'Wagetype') {
                    obs = obs ? obs.switchMap(trans => this.suggestVatType(trans)) : this.suggestVatType(row);
                }

                if (obs) {
                    obs
                        .take(1)
                        .map(trans => this.calcItem(trans))
                        .subscribe(trans => this.updateSalaryChanged(trans, true));
                } else {
                    this.updateSalaryChanged(row);
                }

                return row;
            });
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === '_FileIDs') {
            this.openDocumentsOnRow(event.row);
        }
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

    public updateFileList(event: IUpdatedFileListEvent) {
        let update: boolean;
        this.filteredTransactions.forEach((trans) => {
            if (!event || trans.ID !== event.entityID || trans['_FileIDs'].length === event.files.length) {
                return;
            }

            trans['_FileIDs'] = event.files.map(file => file.ID);
            this.table.updateRow(
                this.filteredTransactions.find(filteredTrans => filteredTrans.ID === trans.ID)['_originalIndex'],
                trans);

            if (!this.selectedPayrollrun.JournalEntryNumber) {
                return;
            }

            trans['_newFiles'] = event.files
                .filter(file => !trans['Files'].some(transFile => transFile.ID === file.ID));
            update = trans['_newFiles'].length;
        });
    }

    private suggestVatType(trans: SalaryTransaction): Observable<SalaryTransaction> {
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
        rowModel['FromDate'] = this.selectedPayrollrun.FromDate;
        rowModel['ToDate'] = this.selectedPayrollrun.ToDate;
        rowModel['_BasePayment'] = wagetype.Base_Payment;

        if (!rowModel.Amount) {
            rowModel['Amount'] = 1;
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

    private fillIn(rowModel: SalaryTransaction): Observable<SalaryTransaction> {
        rowModel.PayrollRunID = this.payrollRunID;
        return this.salaryTransService.completeTrans(rowModel).map(trans => {
            rowModel['Rate'] = trans.Rate;
            rowModel['Text'] = trans.Text;
            rowModel['Sum'] = trans.Sum;
            rowModel['Amount'] = trans.Amount;
            return rowModel;
        });
    }

    private mapEmploymentToTrans(rowModel: SalaryTransaction) {
        const employment = rowModel['employment'];
        rowModel['EmploymentID'] = (employment) ? employment.ID : null;

        if (employment && employment.Dimensions) {
            const department = this.departments.find(x => x.ID === employment.Dimensions.DepartmentID);

            rowModel['_Department'] = department || rowModel['_Department'];

            const project = this.projects.find(x => x.ID === employment.Dimensions.ProjectID);
            rowModel['_Project'] = project || rowModel['_Project'];

            this.mapDepartmentToTrans(rowModel);
            this.mapProjectToTrans(rowModel);
        }
    }

    private mapAccountToTrans(rowModel: SalaryTransaction) {
        const account: Account = rowModel['_Account'];
        if (!account) {
            rowModel.Account = null;
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    private mapProjectToTrans(rowModel: SalaryTransaction) {
        const project = rowModel['_Project'];

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
        const department: Department = rowModel['_Department'];

        if (!rowModel.Dimensions) {
            rowModel.Dimensions = new Dimensions();
        }

        if (!department) {
            rowModel.Dimensions.DepartmentID = null;
            return;
        }

        rowModel.Dimensions.DepartmentID = department.ID;
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

    private checkDates(rowModel) {
        const fromDate: LocalDate = new LocalDate(rowModel['FromDate'].toString());
        const toDate: LocalDate = new LocalDate(rowModel['ToDate'].toString());
        if (toDate < fromDate) {
            rowModel['ToDate'] = fromDate.toString();
        }
    }

    public onSupplementModalClose(trans: SalaryTransaction) {
        if (trans && trans.Supplements && trans.Supplements.length) {
            this.updateSalaryChanged(trans, true);
            this.updateNewOrChangedTable(trans);
        }
    }

    public rowChanged(event) {
        const row: SalaryTransaction = event.rowModel;
        this.updateSalaryChanged(row);
        this.updateNewOrChangedTable(row);

        if (row['_isDirty']) {
            if (!row.ID && !row._createguid) {
                event.rowModel._createguid = this.salaryTransService.getNewGuid();
            }
            this.getSaveActions();
        }

        if (!row.DimensionsID && !row.Dimensions) {
            row.Dimensions = new Dimensions();
        }
    }

    private updateNewOrChangedTable(row: SalaryTransaction) {
        if (row.ID) {
            this.salaryTransactions = this.salaryTransactions.filter(x => x.ID !== row.ID);
        }

        this.newOrChangedSalaryTransactions = [
            ...this.newOrChangedSalaryTransactions
            .filter(salaryTrans => salaryTrans['_originalIndex'] !== row['_originalIndex']),
            row,
        ];
    }

    public onRowDeleted(row: SalaryTransaction) {
        const transIndex: number = this.getTransIndex(row);

        if (row['_isDirty']) {
            this.getSaveActions();
        }

        if (transIndex >= 0) {
            if (this.filteredTransactions[transIndex].ID) {
                row.Deleted = true;
                row['_isDirty'] = true;
                this.deletedLines = [...this.deletedLines, row];
                this.getSaveActions();
            } else {
                this.filteredTransactions.splice(transIndex, 1);
                this.newOrChangedSalaryTransactions =
                    this.newOrChangedSalaryTransactions.filter(
                        trans => trans['_originalIndex'] !== row['_originalIndex'] || !trans.WageTypeID || !trans.EmployeeID
                    );
            }
        }
    }

    private updateSalaryChanged(row, updateTable = false) {
        row['_isDirty'] = true;
        const transIndex = this.getTransIndex(row);

        if (transIndex !== -1) {
            this.filteredTransactions[transIndex] = row;
        } else {
            this.filteredTransactions.push(row);
        }
        if (updateTable) {
            this.table.updateRow(row['_originalIndex'], row);
        }
        this.getSaveActions();
    }

    private getTransIndex(row) {
        let transIndex = null;

        if (row['ID']) {
            transIndex = this.filteredTransactions.findIndex(x => x.ID === row.ID);
        } else {
            row['PayrollRunID'] = this.payrollRunID;
            row['IsRecurringPost'] = false;
            transIndex = this.filteredTransactions.findIndex(
                x => x['_guid'] === row['_guid']
            );
        }

        return transIndex;
    }
}
