import { Component, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { UniTableColumnType, UniTableColumn, UniTableConfig } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs';
import { IUniSaveAction } from '@uni-framework/save/save';
import { AgGridWrapper } from '@uni-framework/ui/ag-grid/ag-grid-wrapper';
import { UniModalService, ConfirmActions, UniConfirmModalV2, IModalOptions } from '@uni-framework/uni-modal';
import { ICellClickEvent } from '@uni-framework/ui/ag-grid/interfaces';
import { IUpdatedFileListEvent, ImageModal } from '@app/components/common/modals/ImageModal';
import { ActivatedRoute, Router } from '@angular/router';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ToastType, ToastService } from '@uni-framework/uniToast/toastService';
import { map } from 'rxjs/operators';
import { SalaryTransactionSuggestedValuesService } from '@app/components/salary/shared/services/salary-transaction/salaryTransactionSuggestedValuesService';
import {
    PayrollRun, WageType, SalaryTransaction, Employment, Dimensions, SalaryTransactionSupplement, WageTypeSupplement, LocalDate, Account
} from '@uni-entities';
import {
    AccountService, UniCacheService, ErrorService, SalaryTransactionService, PayrollrunService, ProjectService, DepartmentService,
    WageTypeService, EmployeeService, PageStateService, StatisticsService, AccountMandatoryDimensionService
} from '@app/services/services';
import { SalaryTransViewService } from '@app/components/salary/shared/services/salary-transaction/salaryTransViewService';
import { UniSalaryTransactionModal } from '@app/components/salary/variable-payrolls/editSalaryTransactionModal';

const PAPERCLIP = '📎'; // It might look empty in your editor, but this is the unicode paperclip

@Component({
    selector: 'uni-variable-payrolls',
    templateUrl: './variable-payrolls.component.html',
    styleUrls: ['./variable-payrolls.component.sass']
})
export class VariablePayrollsComponent {
    @ViewChild(AgGridWrapper)
    public table: AgGridWrapper;

    saveActions: IUniSaveAction[] = [];
    salarytransSelectionTableConfig: UniTableConfig;
    lookupFunction: (urlParams: HttpParams) => any;

    private payrollRunID: number;
    public payrollruns: PayrollRun[] = [];
    public selectedPayrollrun: PayrollRun;
    public salarytransEmployeeTableConfig: UniTableConfig;
    private wagetypes: WageType[] = [];
    public toggle: boolean = false;

    public filteredTransactions: SalaryTransaction[] = [];
    public dirtyTransactions: SalaryTransaction[] = [];
    public initialized: boolean = false;
    public infoMessage: string = `I dette grensesnittet kan du registrere og slette variable lønnsposter. Dersom du slår på visning `
    + `av alle variable lønnsposter kan du redigere lønnsposten under meny-knappen (...-knappen) til høyre i listen.`
    + 'Ved lagring overføres postene automatisk til valgt lønnsavregning. '
    + 'Ved sletting fjernes postene fra valgt lønnsavregning.';

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
        private employeeService: EmployeeService,
        private route: ActivatedRoute,
        private router: Router,
        private tabService: TabService,
        private pageStateService: PageStateService,
        private statisticsService: StatisticsService,
        private toastService: ToastService,
        private accountMandatoryDimensionService: AccountMandatoryDimensionService
    ) {
        this.tabService.addTab({
            name: 'Variable lønnsposter',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.VariablePayrolls,
            active: true
        });

        Observable.forkJoin(
            this.payrollrunService.getAll('filter=StatusCode eq 0 or StatusCode eq null&orderby=ID desc'),
            this.wageTypeService.GetAll('orderBy=WageTypeNumber', ['SupplementaryInformations'])
        ).subscribe(([payrollruns, wageTypes]) => {
            this.payrollruns = payrollruns;
            this.wagetypes = wageTypes;
            this.initialized = true;
            this.route.params.subscribe(params => {
                this.payrollRunID = parseInt(params['id'], 10);

                if (!payrollruns.length) {
                    return;
                } else if (payrollruns.length && !this.payrollRunID) {
                    this.router.navigateByUrl('salary/variablepayrolls/' + payrollruns[0].ID);
                } else {
                    this.selectedPayrollrun = payrollruns.find((payrollrun) => payrollrun.ID === this.payrollRunID);
                    this.updateSaveActions();
                    this.salarytransEmployeeTableConfig = this.createTableConfig(this.toggle);
                    if (this.toggle) {
                        this.createLookupFunction();
                    }
                }
            });

        });
    }

    private updateSaveActions() {
        this.saveActions = [
            {
                label: 'Lagre endringer',
                action: this.saveVariablePayrolls.bind(this),
                main: true,
                disabled: this.toggle || !(this.filteredTransactions.some(x => x['_isDirty'] === true))
            },
        ];
    }

    private saveVariablePayrolls(done: (message: string) => void) {
        this.table.finishEdit();
        this.selectedPayrollrun.transactions = this.filteredTransactions
        .map(trans => this.salaryTransViewService.prepareTransForSave(trans))
        .filter(row => !row['_isEmpty']);

        this.payrollrunService.savePayrollRun(this.selectedPayrollrun).subscribe(payrollrun => {
            this.salaryTransService.invalidateCache();

            if (payrollrun.transactions) {
                let msg: string = '';
                this.accountMandatoryDimensionService.getMandatoryDimensionsReportsForPayroll(payrollrun.transactions)
                .subscribe((reports) => {
                    if (reports) {
                        reports.forEach(report => {
                            if (report) {
                                if (report.MissingRequiredDimensionsMessage !== '') {
                                    msg += '! ' +  report.MissingRequiredDimensionsMessage + '<br/>';
                                }
                                if (report.MissingOnlyWarningsDimensionsMessage) {
                                    msg += report.MissingOnlyWarningsDimensionsMessage + '<br/>';
                                }
                            }
                        });
                        if (msg !== '') {
                            this.toastService.toast({
                                title: 'Dimensjon(er) mangler',
                                message: msg,
                                type: ToastType.warn,
                                duration: 3
                            });
                        }
            }
                });
            }
            this.filteredTransactions = [];
            done('Lagring vellykket');
        }, err => {
            done('Lagring feilet');
            this.errorService.handle(err);
        });
    }

    public toggleChange(event) {
        this.toggle = event.checked;

        this.salarytransEmployeeTableConfig = this.createTableConfig(this.toggle);
        if (this.toggle) {
            this.createLookupFunction();
        }
        this.updateSaveActions();
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

    public onPayrollrunSelect(event) {
        if (event.ID) {
            this.router.navigateByUrl('/salary/variablepayrolls/' + event.ID);
        }
    }

    public editSalaryTransaction(row: any) {
        const config = new UniTableConfig('salary.salarytrans.list', true, false, 20)
        .setColumns(this.getColumns(false))
        .setAutoAddNewRow(false)
        .setContextMenu(this.getContextMenu())
        .setChangeCallback(this.getChangeCallback().bind(this));
        const options: IModalOptions = {
            header: 'Rediger lønnspost',
            data: {
                data: row,
                config: config
            },
            buttonLabels: {
                accept: 'Lagre',
                cancel: 'Avbryt'
            },
            closeOnClickOutside: false
        };

        this.modalService.open(UniSalaryTransactionModal, options).onClose.subscribe(result => {
            if (result) {
                this.table.refreshTableData();
                this.toastService.addToast('Lagring vellykket', ToastType.good);
            }
        });
    }

    public deleteSalaryTransaction(salaryTrans: any) {
        this.modalService.open(UniConfirmModalV2, {
            header: 'Slett lønnspost',
            message: `Er du sikker på at du vil slette lønnspost på ansatt`
            + ` '<strong>${salaryTrans.Name},- </strong>' med sum <strong>${salaryTrans.Sum},- </strong>? Dette kan ikke angres?`,
            buttonLabels: {
                accept: 'Slett',
                reject: 'Avbryt'
            }
        }).onClose.subscribe((res: ConfirmActions) => {
            if (res === ConfirmActions.ACCEPT) {
                this.salaryTransService.removeTransaction(salaryTrans.ID).subscribe(() => {
                    this.createLookupFunction();
                });
            }
        });
    }

    private createLookupFunction() {
        this.lookupFunction = (urlParams: HttpParams) => {
            let params = urlParams || new HttpParams();

            let filterString = params.get('filter') || '';
            filterString += filterString ? ' and ' : '';
            filterString += `(PayrollRunID eq ${this.payrollRunID} and IsRecurringPost eq 'false' and`
            + ` isnull(SalaryBalanceLine.SalaryTransactionID,0) eq 0 and`
            + ` (SystemType eq 0 or SystemType eq 5 or SystemType eq 6))`;

            params = params.set('model', 'SalaryTransaction');
            params = params.set('filter', filterString);
            params = params.set('select',
                'ID as ID,Account as Account,Amount as Amount,Text as Text,IsRecurringPost,SalaryBalanceID,SystemType,'
                + 'FromDate as FromDate,ToDate as ToDate,Sum as Sum,Rate as Rate,bs.Name as Name,WageType.WageTypeNumber as WageTypeNumber,'
                + 'WageType.Base_Payment as BasePayment,Employment.JobName as Job,Employment.ID as JobID,VatType.Name as VatTypeName,'
                + 'Employee.EmployeeNumber as EmployeeNumber,Project.ProjectNumber as ProjectNumber,Project.Name as ProjectName,'
                + 'Department.DepartmentNumber as DepartmentNumber,Department.Name as DepartmentName,count(supplements.ID) as suppcount,'
                + `FileEntityLink.EntityType`);

            params = params.set('join',
                'Employee.BusinessRelationID eq BusinessRelation.ID as bs'
                + ' and SalaryTransaction.ID eq FileEntityLink.EntityID as FileEntityLink'
                + ' and SalaryTransaction.ID eq SalaryBalanceLine.SalaryTransactionID');

            params = params.set('expand', 'Employee,Supplements,Wagetype,Dimensions,Dimensions.Project,Dimensions.Department,VatType,Employment');

            return this.statisticsService.GetAllByHttpParams(params);
        };
    }

    private createTableConfig(isReadOnly: boolean = true) {

        const config = new UniTableConfig('salary.salarytrans.list', !isReadOnly, isReadOnly, 20)
            .setSearchable(isReadOnly)
            .setSortable(isReadOnly)
            .setContextMenu(this.getContextMenu(isReadOnly))
            .setColumns(this.getColumns(isReadOnly))
            .setAutoAddNewRow(!isReadOnly && !this.toggle)
            .setColumnMenuVisible((this.toggle && isReadOnly) || !this.toggle);

            if (!isReadOnly) {
                config
                .setDeleteButton(true)
                .setCopyFromCellAbove(false)
                .setChangeCallback(this.getChangeCallback());
            }
            return config;
    }

    public getChangeCallback() {
        return (event) => {
            let row: SalaryTransaction = event.rowModel;
            let obs: Observable<SalaryTransaction> = null;

            if (event.field === 'Employee') {
                if (row['Employee']) {
                    row.EmployeeID = row['Employee'].ID;
                    row.employment = row['Employee'].Employments.find((e: Employment) => e.Standard);
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

            if (event.field.startsWith('Dimensions')) {
                row.Dimensions = row.Dimensions || new Dimensions();
            }

            if (event.field === 'Dimensions.Project') {
                row.Dimensions.ProjectID = !!row.Dimensions.Project
                ? row.Dimensions.Project.ID
                : null;
            }

            if (event.field === 'Dimensions.Department') {
                row.Dimensions.DepartmentID = !!row.Dimensions.Department
                ? row.Dimensions.Department.ID
                : null;
            }

            if (event.field === 'FromDate' || event.field === 'ToDate') {
                this.checkDates(row);
            }

            if ((event.field === 'Wagetype' || event.field === 'employment') || (event.field === 'Employee' && row.Wagetype)) {
                obs = obs ? obs.switchMap(this.fillIn) : this.fillIn(row);
            }

            if (event.field === '_Account' || event.field === 'Wagetype') {
                obs = obs ? obs.switchMap(trans => this.suggestVatType(trans)) : this.suggestVatType(row);
            }

            if (obs && !this.toggle) {
                obs
                    .take(1)
                    .map(trans => this.calcItem(trans))
                    .subscribe(trans => this.updateSalaryChanged(trans, !this.toggle));
            } else if (this.toggle) {
                row = this.calcItem(row);
            } else {
                this.updateSalaryChanged(row);
            }
            return row;
        };
    }

    public getContextMenu(readOnly: boolean = false) {
        if (readOnly) {
            return [{
                label: 'Rediger lønnspost',
                action: (row) => {
                    this.editSalaryTransaction(row);
                }
            },
            {
                label: 'Slett lønnspost',
                action: (row) => {
                    this.deleteSalaryTransaction(row);
                }
            }];
        } else {
            return  [{
                label: 'Tilleggsopplysninger',
                action: (row) => {
                    this.salaryTransViewService.openSupplements(row, (trans) => this.onSupplementModalClose(trans),
                    this.selectedPayrollrun && !!this.selectedPayrollrun.StatusCode);
                }
            },
            {
                label: 'Legg til dokument',
                action: (row) => {
                    this.openDocumentsOnRow(row);
                }
            }];
        }
    }

    public getColumns(readOnly: boolean) {
        const employeeCol = readOnly
        ? new UniTableColumn('Employee.EmployeeNumber', 'Ansatt', UniTableColumnType.Text)
            .setAlias('EmployeeNumber')
            .setTemplate((row) => {
                return !!row ? row.EmployeeNumber + ' - ' + row.Name : '';
            })
        : new UniTableColumn('Employee', 'Ansatt', UniTableColumnType.Lookup)
            .setTemplate(rowModel => {
                const employee = rowModel['Employee'];
                return employee ? employee.EmployeeNumber + ' - ' + employee.BusinessRelationInfo.Name : '';
            })
            .setOptions({
                itemTemplate: (item) => {
                    return (item.EmployeeNumber + ': ' + item.BusinessRelationInfo.Name);
                },
                searchPlaceholder: 'Velg ansatt',
                lookupFunction: (query) => {
                    return this.employeeService.GetAll(
                        `filter=startswith(EmployeeNumber,'${query}') or contains(BusinessRelationInfo.Name,'${query}')&top=30`,
                        ['BusinessRelationInfo', 'Employments', 'Employments.Dimensions',
                        'Employments.Dimensions.Department', 'Employments.Dimensions.Project']
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text).setWidth('9rem');
        const fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.LocalDate).setFilterable(false);
        const toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.LocalDate).setFilterable(false);
        const rateCol = new UniTableColumn(
            'Rate',
            'Sats',
            UniTableColumnType.Money,
            (row: SalaryTransaction) => !row.Wagetype || !row.Wagetype.DaysOnBoard).setFilterable(false);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number).setWidth('5rem');
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money, false);

        const employmentidCol = readOnly
        ? new UniTableColumn('Employment.JobName', 'Arbeidsforhold', UniTableColumnType.Text)
            .setTemplate(row => row && row.Job ? `${row.JobID} - ${row.Job}` : '')
            .setAlias('Job')
            .setFilterable(false)
        : new UniTableColumn('employment', 'Arbeidsforhold', UniTableColumnType.Select)
            .setFilterable(false)
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
                    if (row['Employee']) {
                        return row['Employee'].Employments || [];
                    }
                    return [];
                },
                itemTemplate: (item) => {
                    return item ? item.ID + ' - ' + item.JobName : '';
                }
            });

        const accountCol = readOnly
        ? new UniTableColumn('Account', 'Konto', UniTableColumnType.Text)
        : new UniTableColumn('_Account', 'Konto', UniTableColumnType.Lookup)
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
            .setWidth('4rem')
            .setFilterable(false);


        const vatTypeCol = readOnly
        ? new UniTableColumn('VatType.Name', 'Mva', UniTableColumnType.Text)
            .setAlias('VatTypeName')
        : this.salaryTransViewService.createVatTypeColumn();

        const projectCol = readOnly
        ? new UniTableColumn('Project.ProjectNumber', 'Prosjekt', UniTableColumnType.Text)
            .setTemplate(row => row && row.ProjectNumber ? `${row.ProjectNumber} - ${row.ProjectName}` : '')
            .setAlias('ProjectNumber')
            .setFilterable(false)
        : new UniTableColumn('Dimensions.Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Project) {
                    const project = rowModel.Dimensions.Project;
                    return project.ProjectNumber + ': ' + project.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Project.Name')
            .setFilterable(false)
            .setOptions({
                itemTemplate: (item) => {
                    return (item.ProjectNumber + ': ' + item.Name);
                },
                searchPlaceholder: 'Velg prosjekt',
                lookupFunction: (query) => {
                    return this.projectService.GetAll(
                        `filter=startswith(ProjectNumber,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const departmentCol = readOnly
        ? new UniTableColumn('Department.DepartmentNumber', 'Avdeling', UniTableColumnType.Text)
            .setTemplate(row => row && row.DepartmentNumber ? `${row.DepartmentNumber} - ${row.DepartmentName}` : '')
            .setAlias('DepartmentNumber')
            .setFilterable(false)
        : new UniTableColumn('Dimensions.Department', 'Avdeling', UniTableColumnType.Lookup)
            .setVisible(false)
            .setTemplate((rowModel) => {
                if (!rowModel['_isEmpty'] && rowModel.Dimensions && rowModel.Dimensions.Department) {
                    const dep = rowModel.Dimensions.Department;
                    return dep.DepartmentNumber + ': ' + dep.Name;
                }

                return '';
            })
            .setDisplayField('Dimensions.Department.Name')
            .setFilterable(false)
            .setOptions({
                itemTemplate: (item) => {
                    return (item.DepartmentNumber + ': ' + item.Name);
                },
                searchPlaceholder: 'Velg avdeling',
                lookupFunction: (query) => {
                    return this.departmentService.GetAll(
                        `filter=startswith(DepartmentNumber,'${query}') or contains(Name,'${query}')&top=30`
                    ).catch((err, obs) => this.errorService.handleRxCatch(err, obs));
                }
            });

        const payoutCol =
        readOnly ? new UniTableColumn('WageType.Base_Payment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate(dataItem => dataItem && dataItem.BasePayment ? 'Ja' : 'Nei')
            .setWidth('5.3rem')
            .setAlias('BasePayment')
        : new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {
                return dataItem && dataItem.Wagetype ? (dataItem.Wagetype.Base_Payment ? 'Ja' : 'Nei') : '';
        }).setWidth('5.3rem');

        const wageTypeCol = readOnly
        ? new UniTableColumn('WageType.WageTypeNumber', 'Lønnsart', UniTableColumnType.Text).setAlias('WageTypeNumber')
        : new UniTableColumn('Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
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
            .setWidth('5rem')
            .setFilterable(false);

        const fileCol = new UniTableColumn('FileEntityLinkEntityType', PAPERCLIP, UniTableColumnType.Text, false)
            .setTemplate(row => row['FileEntityLinkEntityType'] ? PAPERCLIP : '')
            .setWidth(32)
            .setResizeable(false)
            .setFilterable(false)
            .setSkipOnEnterKeyNavigation(true);

        const supplementCol = readOnly
        ? new UniTableColumn('count(supplements.ID)', '...', UniTableColumnType.Text, false)
            .setTemplate(() => '')
            .setAlias('suppcount')
            .setWidth(60)
            .setTooltipResolver(row => {
                if (!row || row.suppcount === 0) {
                    return;
                } else {
                    return {
                        type: 'neutral',
                        text: 'Kan ha tilleggsopplysninger'
                    };
                }
            })
        : this.salaryTransViewService.createSupplementsColumn(
            (trans) => this.onSupplementModalClose(trans),
            () => this.selectedPayrollrun && !!this.selectedPayrollrun.StatusCode)
            .setFilterable(false);

        let cols = [ employeeCol, wageTypeCol, wagetypenameCol, employmentidCol, fromdateCol, toDateCol, accountCol, vatTypeCol,
            amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol, supplementCol ];

        if (readOnly) {
            cols = cols.concat([fileCol]);
        }
        return cols;
    }

    public onCellClick(event: ICellClickEvent) {
        if (event.column.field === 'FileEntityLinkEntityType') {
            this.openDocumentsOnRow(event.row);
        } else if (event.column.field === 'count(supplements.ID)') {
            this.editSalaryTransaction(event.row);
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
                this.table.refreshTableData();
            });
        } else {
            this.toastService.addToast('Linje må lagres', ToastType.warn, 5, 'Lagre linje før du kan legge til dokument');
        }
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
        return this.salaryTransService.completeTrans(rowModel)
            .pipe(
                map((transes: SalaryTransaction[]) => {
                    this.filteredTransactions = this.salaryTransService.updateDataSource(this.filteredTransactions, transes);

                    return this.salaryTransService.fillInRowmodel(rowModel, transes[0]);
                })
            );
    }

    private mapEmploymentToTrans(rowModel: any) {
        const employment = rowModel['employment'];
        rowModel['EmploymentID'] = (employment) ? employment.ID : null;

        if (employment && employment.Dimensions) {
            rowModel.Dimensions = rowModel.Dimensions || {};

            if (employment.Dimensions.DepartmentID) {
                rowModel.Dimensions.Department = employment.Dimensions.Department;
                rowModel.Dimensions.DepartmentID = employment.Dimensions.DepartmentID;
            }

            if (employment.Dimensions.ProjectID) {
                rowModel.Dimensions.Project = employment.Dimensions.Project;
                rowModel.Dimensions.ProjectID = employment.Dimensions.ProjectID;
            }
        } else {
            rowModel.Dimensions = null;
            rowModel.DimensionsID = null;
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
            this.salaryTransService.supplements = trans.Supplements;
            this.updateSalaryChanged(trans, true);
        }
    }

    public rowChanged(event) {
        const row: SalaryTransaction = event.rowModel;
        this.updateSalaryChanged(row);

        if (row['_isDirty']) {
            if (!row.ID && !row._createguid) {
                event.rowModel._createguid = this.salaryTransService.getNewGuid();
            }
            this.updateSaveActions();
        }
    }

    public onRowDeleted(row: SalaryTransaction) {
        const transIndex: number = this.getTransIndex(row);

        if (row['_isDirty']) {
            this.updateSaveActions();
        }

        if (transIndex >= 0) {
            this.filteredTransactions.splice(transIndex, 1);
            this.updateSaveActions();
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
        this.updateSaveActions();
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
