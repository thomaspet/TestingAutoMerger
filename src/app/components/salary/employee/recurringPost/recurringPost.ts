import {Component, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {
    UniCacheService, AccountService,
    ErrorService, SalaryTransactionSuggestedValuesService, SalaryTransactionService
} from '../../../../services/services';
import {SalaryTransViewService} from '../../sharedServices/salaryTransViewService';
import {
    UniTableColumn,
    UniTableColumnType,
    UniTableConfig
} from '../../../../../framework/ui/unitable/index';
import {
    Employment, SalaryTransaction, WageType, Dimensions, Department, Project,
    SalaryTransactionSupplement, WageTypeSupplement, Account
} from '../../../../unientities';
import {UniView} from '../../../../../framework/core/uniView';
import {BehaviorSubject, Observable} from 'rxjs';
import {AgGridWrapper} from '@uni-framework/ui/ag-grid/ag-grid-wrapper';


@Component({
    selector: 'reccuringpost-list',
    templateUrl: './recurringPost.html'
})
export class RecurringPost extends UniView {
    @ViewChild(AgGridWrapper) private table: AgGridWrapper;

    private employeeID: number;
    public tableConfig: UniTableConfig;
    public recurringPosts: SalaryTransaction[] = [];
    private employments: Employment[] = [];
    private wagetypes: WageType[] = [];
    private projects: Project[] = [];
    private departments: Department[] = [];
    private unsavedEmployments$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private refresh: boolean;

    constructor(
        public router: Router,
        protected cacheService: UniCacheService,
        protected route: ActivatedRoute,
        private _accountService: AccountService,
        private errorService: ErrorService,
        private suggestedValuesService: SalaryTransactionSuggestedValuesService,
        private salaryTransViewService: SalaryTransViewService,
        private salaryTransService: SalaryTransactionService
    ) {

        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.recurringPosts = [];

            this.employeeID = +paramsChange['id'];

            const recurringPostSubject = super.getStateSubject('recurringPosts');
            const employmentSubject = super.getStateSubject('employments');
            const projectSubject = super.getStateSubject('projects');
            const departmentSubject = super.getStateSubject('departments');
            const wageTypesSubject = super.getStateSubject('wageTypes');

            wageTypesSubject.take(1).subscribe(wageTypes => {
                this.wagetypes = wageTypes;
            });

            projectSubject.take(1).subscribe(projects => {
                this.projects = projects;
            });

            departmentSubject.take(1).subscribe(departments => {
                this.departments = departments;
            });

            recurringPostSubject.subscribe((posts: SalaryTransaction[]) => {
                if (!this.recurringPosts
                    || !this.recurringPosts.length
                    || this.refresh
                    || !posts.some(x => x['_isDirty'] || x.Deleted)) {
                    this.recurringPosts = posts;
                    this.refresh = false;
                }

                if (!this.tableConfig) {
                    this.buildTableConfig();
                }
            });

            employmentSubject
                .take(1)
                .do(employments => this.unsavedEmployments$
                    .next(employments.some(x => !x.ID) && super.isDirty('employments')))
                .subscribe(employments => {
                    this.employments = (employments || []).filter(emp => emp.ID > 0);
                });
        });
    }

    public onRowDeleted() {
        const hasDirtyRow = this.recurringPosts.some(post => post['_isDirty'] || post.Deleted);
        this.refresh = true;
        super.updateState('recurringPosts', this.recurringPosts, hasDirtyRow);
    }

    private buildTableConfig() {
        const wagetypeCol = new UniTableColumn('_Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
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
            });

        const descriptionCol = new UniTableColumn('Text', 'Beskrivelse');

        const employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                let employment = rowModel['_Employment'];


                if (!employment && rowModel['EmploymentID']) {
                    employment = this.employments.find(emp => emp.ID === rowModel.EmploymentID);
                }

                return (employment) ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setOptions({
                lookupFunction: (searchValue: string) => {
                    return this.employments.filter((employment) => {
                        const jobName = (employment.JobName || '').toLowerCase();
                        const jobCode = (employment.JobCode || '').toLowerCase();
                        return (jobName.indexOf(searchValue.toLowerCase()) > -1)
                            || jobCode.startsWith(searchValue.toLowerCase());
                    });
                },
                itemTemplate: (selectedItem) => {
                    return selectedItem ? selectedItem.ID + ' - ' + selectedItem.JobName : '';
                }
            });

        const fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', UniTableColumnType.LocalDate);
        const todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', UniTableColumnType.LocalDate);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money, false);
        const payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                const wagetype: WageType = dataItem.Wagetype || (this.wagetypes && this.wagetypes.find(x => x.WageTypeNumber === dataItem.WageTypeNumber));

                if (!wagetype) {
                    return;
                }
                if (wagetype.Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
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
                    return this._accountService
                        .GetAll(
                            `filter=contains(AccountName, '${searchValue}') `
                            + `or startswith(AccountNumber, '${searchValue}')&top50`
                        )
                        .debounceTime(200);
                }
            });

        const VatTypeCol = this.salaryTransViewService.createVatTypeColumn();

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

        const supplementsCol = this.salaryTransViewService
            .createSupplementsColumn((trans) => this.onSupplementsClose(trans), () => false);

        this.tableConfig = new UniTableConfig('salary.employee.recurringPost', this.employeeID ? true : false)
            .setDeleteButton(true)
            .setColumnMenuVisible(true)
            .setAutoAddNewRow(true)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.salaryTransViewService
                        .openSupplements(row, (trans) => this.onSupplementsClose(trans), false);
                }
            }])
            .setDefaultRowData({IsRecurringPost: true})
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol, accountCol, VatTypeCol,
                amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol, supplementsCol
            ])
            .setChangeCallback((event) => {
                const row = event.rowModel;

                if (event.field === '_Wagetype' && row['_Wagetype']) {
                    this.mapWagetypeToRecurringpost(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === '_Account') {
                    this.mapAccountToTrans(row);
                }

                if (event.field === '_Project') {
                    this.salaryTransViewService.mapProjectToTrans(row);
                }

                if (event.field === '_Department') {
                    this.salaryTransViewService.mapDepartmentToTrans(row);
                }

                if (event.field === '_Employment') {
                    this.salaryTransViewService.mapEmploymentToTrans(row, this.departments, this.projects);
                }

                let obs = null;
                if ((event.field === '_Wagetype' || event.field === '_Employment') && row['_Wagetype']) {
                    obs = obs ? obs.switchMap(this.fillIn) : this.fillIn(row);
                }

                if (event.field === '_Account' || event.field === '_Wagetype') {
                    obs = obs ? obs.switchMap(trans => this.suggestVatType(trans)) : this.suggestVatType(row);
                }

                if (obs) {
                    return obs
                        .map((trans) => this.calcItem(trans))
                        .switchMap(trans => this.suggestedValuesService.suggestFromDate(trans, true))
                        .do(trans => this.updateAndCacheSalaryTransactionRow(trans, true));
                } else {
                    this.updateAndCacheSalaryTransactionRow(row);
                    return row;
                }
            });
    }

    private suggestVatType(trans: SalaryTransaction) {
        return this.suggestedValuesService
            .suggestVatType(trans)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private updateAndCacheSalaryTransactionRow(row, updateTable = false) {
        row['_isDirty'] = true;

        const updateIndex = this.recurringPosts.findIndex(x => x['_originalIndex'] === row['_originalIndex']);
        if (updateIndex > -1) {
            this.recurringPosts[updateIndex] = row;
        } else {
            this.recurringPosts.push(row);
        }
        if (updateTable) {
            this.table.updateRow(row['_originalIndex'], row);
        }
        super.updateState('recurringPosts', this.recurringPosts, true);
    }

    private mapWagetypeToRecurringpost(rowModel) {
        if (!rowModel['EmploymentID']) {
            const employment = this.employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['_Employment'] = employment;
            }
        }
        this.salaryTransViewService.mapEmploymentToTrans(rowModel, this.departments, this.projects);

        const wagetype = rowModel['_Wagetype'];
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['Rate'] = wagetype.Rate;

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
        rowModel.EmployeeID = this.employeeID;
        return this.salaryTransService.completeTrans(rowModel).map(trans => {
            rowModel['Rate'] = trans.Rate;
            rowModel['Text'] = trans.Text;
            rowModel['Sum'] = trans.Sum;
            rowModel['Amount'] = trans.Amount;
            return rowModel;
        });
    }

    private mapAccountToTrans(rowModel: SalaryTransaction) {
        const account: Account = rowModel['_Account'];
        if (!account) {
            return;
        }

        rowModel.Account = account.AccountNumber;
    }

    private calcItem(rowModel: SalaryTransaction): SalaryTransaction {
        let decimals = rowModel.Amount ? rowModel.Amount.toString().split('.')[1] : null;
        const amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel.Rate ? rowModel.Rate.toString().split('.')[1] : null;
        const ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        const sum = (Math.round((amountPrecision * rowModel.Amount))
            * Math.round((ratePrecision * rowModel.Rate))) / (amountPrecision * ratePrecision);
        rowModel.Sum = sum;
        return rowModel;
    }

    public onSupplementsClose(trans: SalaryTransaction) {
        if (trans && trans.Supplements && trans.Supplements.length) {
            this.updateSupplementsOnTransaction(trans);
        }
    }

    public updateSupplementsOnTransaction(trans: SalaryTransaction) {
        if (trans) {
            const row: SalaryTransaction = this.recurringPosts
                .find((x: SalaryTransaction) => x['_originalIndex'] === trans['_originalIndex'] && !x.Deleted);
            if (row) {
                row.Supplements = trans.Supplements;
                this.updateAndCacheSalaryTransactionRow(row);
            }
        }
    }
}
