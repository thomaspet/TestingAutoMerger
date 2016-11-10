import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WageTypeService, SalaryTransactionService, UniCacheService } from '../../../../services/services';
import { UniTableColumn, UniTableColumnType, UniTableConfig, UniTable } from 'unitable-ng2/main';
import { Employment, SalaryTransaction, WageType, SalaryTransactionSupplement, WageTypeSupplement } from '../../../../unientities';
import { UniView } from '../../../../../framework/core/uniView';
import { Observable } from 'rxjs/Observable';
import { SalaryTransactionSupplementsModal } from '../../modals/salaryTransactionSupplementsModal';

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
    @ViewChild(UniTable) private uniTable: UniTable;
    @ViewChild(SalaryTransactionSupplementsModal) private supplementModal: SalaryTransactionSupplementsModal;

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
            this.wagetypeService.GetAll('', ['SupplementaryInformations']).subscribe((wagetypes: WageType[]) => {
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
            .setContextMenu([{
                label: 'Tilleggsopplysninger', action: (row) => {
                    this.openSuplementaryInformationModal(row);
                }
            }])
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === '_Wagetype' && row['_Wagetype']) {
                    this.mapWagetypeToRecurrinpost(row);
                }

                if (event.field === '_Employment') {
                    const employment = row['_Employment'];
                    row['EmploymentID'] = (employment) ? employment.ID : null;
                    this.getRate(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === 'recurringPostValidFrom' && row['recurringPostValidFrom']) {
                    row['recurringPostValidFrom'] = this.fixTimezone(row['recurringPostValidFrom']);
                }

                if (event.field === 'recurringPostValidTo' && row['recurringPostValidTo']) {
                    row['recurringPostValidTo'] = this.fixTimezone(row['recurringPostValidTo']);
                }

                this.updateAndCacheSalaryTransactionRow(row);

                return row;
            });
    }

    private updateAndCacheSalaryTransactionRow(row) {
        row['_isDirty'] = true;
        this.recurringPosts[row['_originalIndex']] = row;
        this.uniTable.updateRow(row['_originalIndex'], row);
        super.updateState('recurringPosts', this.recurringPosts, true);
    }

    private mapWagetypeToRecurrinpost(rowModel) {
        if (!rowModel['EmploymentID']) {
            let employment = this.employments.find(emp => emp.Standard === true);
            if (employment) {
                rowModel['EmploymentID'] = employment.ID;
            }
        }

        let wagetype = rowModel['_Wagetype'];
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['WageTypeID'] = wagetype.ID;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;

        this.getRate(rowModel);

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
        this.salarytransService.getRate(rowModel['WageTypeID'], rowModel['EmploymentID'], rowModel['EmployeeID']).subscribe(rate => {
            rowModel['Rate'] = rate;
            this.calcItem(rowModel);
            this.updateAndCacheSalaryTransactionRow(rowModel);
        });
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
        this.supplementModal.openModal(row);
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
