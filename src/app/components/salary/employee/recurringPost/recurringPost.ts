import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WageTypeService, SalaryTransactionService, UniCacheService, AccountService } from '../../../../services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig, UniTable } from 'unitable-ng2/main';
import {
    Employment, SalaryTransaction, WageType, Dimensions, Department, Project,
    SalaryTransactionSupplement, WageTypeSupplement, Account } from '../../../../unientities';
import { UniView } from '../../../../../framework/core/uniView';
import { Observable } from 'rxjs/Observable';
import { SalaryTransactionSupplementsModal } from '../../modals/salaryTransactionSupplementsModal';
import { ErrorService } from '../../../../services/common/ErrorService';

declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html'
})

export class RecurringPost extends UniView {
    private tableConfig: UniTableConfig;
    private recurringPosts: SalaryTransaction[] = [];
    private filteredPosts: SalaryTransaction[];
    private employments: Employment[] = [];
    private wagetypes: WageType[];
    private projects: Project[] = [];
    private departments: Department[] = [];
    private unsavedEmployments: boolean;
    private employmentsMapped: boolean;
    @ViewChild(UniTable) private uniTable: UniTable;
    @ViewChild(SalaryTransactionSupplementsModal) private supplementModal: SalaryTransactionSupplementsModal;

    constructor(
        public router: Router,
        private wagetypeService: WageTypeService,
        private salarytransService: SalaryTransactionService,
        cacheService: UniCacheService,
        route: ActivatedRoute,
        private _accountService: AccountService,
        private errorService: ErrorService
    ) {

        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);
            this.employmentsMapped = false;

            // TODO: cache this?
            if (!this.wagetypes) {
                this.wagetypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
                    this.wagetypes = wagetypes;
                    if (this.recurringPosts) {
                        this.mapWageTypes();
                    }
                },
                err => this.errorService.handle(err));
            }

            const recurringPostSubject = super.getStateSubject('recurringPosts');
            const employmentSubject = super.getStateSubject('employments');
            const projectSubject = super.getStateSubject('projects');
            const departmentSubject = super.getStateSubject('departments');

            projectSubject.subscribe( projects => {
                this.projects = projects;
            });

            departmentSubject.subscribe(departments => {
                this.departments = departments;
            });

            recurringPostSubject.subscribe(posts => {
                this.recurringPosts = posts;
                this.filteredPosts = this.recurringPosts.filter(post => !post.Deleted);
                if (this.uniTable) {
                    this.uniTable.refreshTableData();
                }
            });

            employmentSubject.subscribe( employments => {
                this.employments = (employments || []).filter(emp => emp.ID > 0);
                this.unsavedEmployments = this.employments.length !== employments.length;
                if (this.tableConfig && !this.employmentsMapped) {
                    this.mapEmployments();
                }
            });

            if (!this.tableConfig) {
                Observable.combineLatest(recurringPostSubject, employmentSubject)
                    .take(1)
                    .subscribe((res) => {
                        let [recurring, employments] = res;
                        this.employments = (employments || []).filter(emp => emp.ID > 0);
                        this.recurringPosts = recurring;
                        if (!this.employmentsMapped) {
                            this.mapEmployments();
                        }

                        this.filteredPosts = this.recurringPosts.filter(post => !post.Deleted);
                        this.unsavedEmployments = this.employments.length !== employments.length;

                        this.buildTableConfig();
                    },
                    err => this.errorService.handle(err)
                );
            }
        });
    }

    private mapWageTypes() {
        this.recurringPosts = this.recurringPosts.map((post) => {
            if (post['WageTypeID']) {
                post['_Wagetype'] = this.wagetypes.find(wt => wt.ID === post['WageTypeID']);
            }
            return post;
        });
    }

    private mapEmployments() {
        this.recurringPosts = this.recurringPosts.map((post) => {
            if (post['EmploymentID']) {
                post['_Employment'] = this.employments.find(emp => emp.ID === post['EmploymentID']);
            }
            return post;
        });

        this.employmentsMapped = true;
        super.updateState('recurringPosts', this.recurringPosts, false);
    }

    // REVISIT (remove)!
    // This (and the canDeactivate in employeeRoutes.ts) is a dummy-fix
    // until we are able to locate a problem with detecting changes of
    // destroyed view in unitable.
    public canDeactivate() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            });
        });
    }
    private onRowDeleted(event) {
        if (event.rowModel['_isEmpty']) {
            return;
        }

        let deletedIndex = this.recurringPosts.findIndex(x => x['_originalIndex'] === event.rowModel['_originalIndex']);
        let hasDirtyRow: boolean = true;

        if (this.recurringPosts[deletedIndex].ID) {
            this.recurringPosts[deletedIndex].Deleted = true;
        } else {
            this.recurringPosts.splice(deletedIndex, 1);
            // Check if there are other rows in the array that are dirty
            hasDirtyRow = this.recurringPosts.some(post => post['_isDirty']);
        }
        this.recurringPosts[deletedIndex]['_originalIndex'] = null;
        super.updateState('recurringPosts', this.recurringPosts, hasDirtyRow);
    }

    private buildTableConfig() {
        const wagetypeCol = new UniTableColumn('_Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
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

        const descriptionCol = new UniTableColumn('Text', 'Beskrivelse');

        const employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                let employment = rowModel['_Employment'];

                if (rowModel['EmploymentID']) {
                    employment = this.employments.find(emp => emp.ID === rowModel.EmploymentID);
                } else {
                    return '';
                }

                return (employment) ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setEditorOptions({
                lookupFunction: (searchValue: string) => {
                    return this.employments.filter((employment) => {
                        let jobName = (employment.JobName || '').toLowerCase();
                        let jobCode = (employment.JobCode || '').toLowerCase();
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
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money);
        const payoutCol = new UniTableColumn('_BasePayment', 'Utbetales', UniTableColumnType.Number, false)
            .setTemplate((dataItem: SalaryTransaction) => {

                const wagetype: WageType = dataItem['_Wagetype'] || dataItem.Wagetype;

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
            .setEditorOptions({
                itemTemplate: (selectedItem: Account) => {
                    return (selectedItem.AccountNumber + ' - ' + selectedItem.AccountName);
                },
                lookupFunction: (searchValue) => {
                    return this._accountService.GetAll(`filter=contains(AccountName, '${searchValue}') or startswith(AccountNumber, '${searchValue}')&top50`).debounceTime(200);
                }
            });

        const projectCol = new UniTableColumn('_Project', 'Prosjekt', UniTableColumnType.Lookup)
            .setTemplate((rowModel: SalaryTransaction) => {

                let project = rowModel['_Project'];
                if (!rowModel['_isEmpty'] && project) {
                    return project.ProjectNumber + ' - ' + project.Name;
                }

                return '';
            })
            .setEditorOptions({
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

                let department: Department = rowModel['_Department'];
                if (!rowModel['_isEmpty'] && department) {
                    return department.DepartmentNumber + ' - ' + department.Name;
                }

                return '';
            })
            .setEditorOptions({
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



        this.tableConfig = new UniTableConfig()
            .setDeleteButton(true)
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.openSuplementaryInformationModal(row);
                }
            }])
            .setColumnMenuVisible(true)
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol, accountCol,
                amountCol, rateCol, sumCol, payoutCol, projectCol, departmentCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;
                let rateObservable = null;

                if (event.field === '_Wagetype' && row['_Wagetype']) {
                    this.mapWagetypeToRecurringpost(row);
                    rateObservable = this.getRate(row);
                }

                if (event.field === '_Employment') {
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

                if (rateObservable) {
                    rateObservable.subscribe(rate => {
                        row['Rate'] = rate;
                        this.calcItem(row);
                        this.updateAndCacheSalaryTransactionRow(row, true);
                    });
                } else {
                    this.updateAndCacheSalaryTransactionRow(row);
                }

                return row;
            });
    }

    private updateAndCacheSalaryTransactionRow(row, updateTable = false) {
        row['_isDirty'] = true;
        this.recurringPosts[row['_originalIndex']] = row;

        if (updateTable) {
            this.uniTable.updateRow(row['_originalIndex'], row);
        }

        super.updateState('recurringPosts', this.recurringPosts, true);
    }

    private mapWagetypeToRecurringpost(rowModel) {
        if (!rowModel['EmploymentID']) {
            let employment = this.employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['_Employment'] = employment;
                this.mapEmploymentToTrans(rowModel);
            }
        }

        let wagetype = rowModel['_Wagetype'];
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;

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

    private mapEmploymentToTrans(rowModel: SalaryTransaction) {
        const employment = rowModel['_Employment'];
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

    private mapProjectToTrans(rowModel: SalaryTransaction) {
        let project = rowModel['_Project'];

        if (!rowModel.Dimensions) {
            rowModel.Dimensions = new Dimensions();
        }

        if (!project) {
            rowModel.Dimensions.ProjectID = 0;
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
            rowModel.Dimensions.DepartmentID = 0;
            return;
        }

        rowModel.Dimensions.DepartmentID = department.ID;
    }

    private calcItem(rowModel) {
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        let amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        let ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        let sum = (Math.round((amountPrecision * rowModel['Amount'])) * Math.round((ratePrecision * rowModel['Rate']))) / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
    }

    public openSuplementaryInformationModal(row: SalaryTransaction) {
        this.supplementModal.openModal(row, false);
    }

    public updateSupplementsOnTransaction(trans: SalaryTransaction) {
        if (trans) {
            let row: SalaryTransaction = this.recurringPosts.find(x => x.ID === trans.ID && !x.Deleted);
            if (row) {
                row.Supplements = trans.Supplements;
                this.updateAndCacheSalaryTransactionRow(row);
            }
        }
    }
}
