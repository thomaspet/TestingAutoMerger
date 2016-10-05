import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WageTypeService, SalaryTransactionService, UniCacheService} from '../../../../services/services';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {AsyncPipe} from '@angular/common';
import {UniView} from '../../../../../framework/core/uniView';
declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable],
    providers: [WageTypeService, SalaryTransactionService],
    pipes: [AsyncPipe]
})

export class RecurringPost extends UniView {
    private tableConfig: UniTableConfig;
    private recurringPosts: SalaryTransaction[] = [];
    private employments: Employment[] = [];
    private wagetypes: WageType[];

    constructor(public router: Router,
                private wagetypeService: WageTypeService,
                private salarytransService: SalaryTransactionService,
                cacheService: UniCacheService,
                route: ActivatedRoute) {

        super(router.url, cacheService);
        // this.buildTableConfig();

        // Update cache key and (re)subscribe when param changes (different employee selected)
        route.parent.params.subscribe((paramsChange) => {
            super.updateCacheKey(router.url);

            // TODO: cache this?
            this.wagetypeService.GetAll('').subscribe((wagetypes: WageType[]) => {
                this.wagetypes = wagetypes;
            });

            super.getStateSubject('recurringPosts').subscribe(recurringPosts => this.recurringPosts = recurringPosts);
            super.getStateSubject('employments').subscribe((employments: Employment[]) => {
                this.employments = employments || [];
                this.buildTableConfig();

                if (this.employments && this.employments.find(employment => !employment.ID)) {
                    this.tableConfig.setEditable(false);
                } else {
                    this.tableConfig.setEditable(true);
                }
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
            .setDeleteButton({
                deleteHandler: (rowModel: SalaryTransaction) => {
                    if (isNaN(rowModel.ID)) { return true; }
                    return this.salarytransService.delete(rowModel.ID);
                }
            })
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
