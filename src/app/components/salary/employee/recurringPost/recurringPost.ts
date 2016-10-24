import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WageTypeService, SalaryTransactionService, UniCacheService} from '../../../../services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {UniView} from '../../../../../framework/core/uniView';
import {Observable} from 'rxjs/Observable';
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
    private unsavedEmployments: boolean;
    private employmentsMapped: boolean;

    constructor(public router: Router,
                private wagetypeService: WageTypeService,
                private salarytransService: SalaryTransactionService,
                cacheService: UniCacheService,
                route: ActivatedRoute) {

        super(router.url, cacheService);

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);

            // TODO: cache this?
            this.wagetypeService.GetAll('').subscribe((wagetypes: WageType[]) => {
                this.wagetypes = wagetypes;
            });

            const recurringPostSubject = super.getStateSubject('recurringPosts');
            const employmentSubject = super.getStateSubject('employments');

            Observable.combineLatest(recurringPostSubject, employmentSubject).take(1)
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
                });
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

    // REVISIT: Remove this when pure dates (no timestamp) are implemented on backend!
    private fixTimezone(date): Date {
        if (typeof date === 'string') {
            return new Date(date);
        }

        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }

    private onRowDeleted(event) {
        if (event.rowModel['_isEmpty']) {
            return;
        }

        let deletedIndex = event.rowModel['_originalIndex'];
        let hasDirtyRow: boolean = true;

        if (this.recurringPosts[deletedIndex].ID) {
            this.recurringPosts[deletedIndex].Deleted = true;
        } else {
            this.recurringPosts.splice(deletedIndex, 1);
            // Check if there are other rows in the array that are dirty
            hasDirtyRow = this.recurringPosts.some(post => post['_isDirty']);
        }
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

        const fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', UniTableColumnType.Date);
        const todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', UniTableColumnType.Date);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Money);
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Money);

        this.tableConfig = new UniTableConfig()
            .setDeleteButton(true)
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;
                row['_isDirty'] = true;

                console.log(row, row['_Employment'], row['EmploymentID']);

                if (event.field === '_Wagetype' && row['_Wagetype']) {
                    this.mapWagetypeToRecurrinpost(row);
                }

                if (event.field === '_Employment') {
                    const employment = row['_Employment'];
                    row['EmploymentID'] = (employment) ? employment.ID : null;
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if  (event.field === 'recurringPostValidFrom' && row['recurringPostValidFrom']) {
                    row['recurringPostValidFrom'] = this.fixTimezone(row['recurringPostValidFrom']);
                }

                if  (event.field === 'recurringPostValidTo' && row['recurringPostValidTo']) {
                    row['recurringPostValidTo'] = this.fixTimezone(row['recurringPostValidTo']);
                }

                // Update local array and cache
                this.recurringPosts[row['_originalIndex']] = row;
                super.updateState('recurringPosts', this.recurringPosts, true);

                return row;
            });
    }

    private mapWagetypeToRecurrinpost(rowModel) {
        let wagetype = rowModel['_Wagetype'];
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;

        let employment = this.employments.find(emp => emp.Standard === true);
        if (employment) {
            rowModel['EmploymentID'] = employment.ID;
        }

        this.calcItem(rowModel);
    }

    private calcItem(rowModel) {
        let decimals = rowModel['Amount'] ? rowModel['Amount'].toString().split('.')[1] : null;
        let amountPrecision = Math.pow(10, decimals ? decimals.length : 1);
        decimals = rowModel['Rate'] ? rowModel['Rate'].toString().split('.')[1] : null;
        let ratePrecision = Math.pow(10, decimals ? decimals.length : 1);
        let sum = (Math.round((amountPrecision * rowModel['Amount'])) * Math.round(( ratePrecision * rowModel['Rate']))) / (amountPrecision * ratePrecision);
        rowModel['Sum'] = sum;
    }

}
