import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WageTypeService, SalaryTransactionService, UniCacheService} from '../../../../services/services';
import {UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {UniView} from '../../../../../framework/core/uniView';
declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html'
})

export class RecurringPost extends UniView {
    private tableConfig: UniTableConfig;
    private recurringPosts: SalaryTransaction[] = [];
    private employments: Employment[] = [];
    private wagetypes: WageType[];
    private unsavedEmployments: boolean;

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

            super.getStateSubject('recurringPosts').subscribe((recurringPosts) => {
                this.recurringPosts = recurringPosts.filter(post => !post.Deleted);
            });

            super.getStateSubject('employments').subscribe((employments: Employment[]) => {
                this.employments = (employments || []).filter(emp => emp.ID > 0);
                this.unsavedEmployments = this.employments.length !== employments.length;
                this.buildTableConfig();
            });
        });
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

        const employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Select)
            .setTemplate((rowModel) => {

                if (!rowModel['_Employment'] && !rowModel['EmploymentID']) {
                    return '';
                }

                let employment = rowModel['_Employment'];

                if (!employment) {
                    employment = this.employments.find(emp => emp.ID === rowModel.EmploymentID);
                }

                return (employment) ? employment.ID + ' - ' + employment.JobName : '';
            })
            .setEditorOptions({
                resource: this.employments,
                itemTemplate: (selectedItem) => {
                    return selectedItem ? selectedItem.ID + ' - ' + selectedItem.JobName : '';
                }
            });

        const fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', UniTableColumnType.Date);
        const todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', UniTableColumnType.Date);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number);

        this.tableConfig = new UniTableConfig()
            .setDeleteButton(true)
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;
                row['_isDirty'] = true;

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
