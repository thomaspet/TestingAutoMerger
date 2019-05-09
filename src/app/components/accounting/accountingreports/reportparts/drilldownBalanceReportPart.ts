import {Component, Input, OnChanges} from '@angular/core';
import {Observable} from 'rxjs';
import {PeriodFilter} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal, IDetailsModalInput} from '../detailsmodal/accountDetailsReportModal';
import {UniModalService} from '../../../../../framework/uni-modal';
import {INumberOptions} from '../../../../../framework/ui/uniform/index';

import {
    AccountGroupService,
    StatisticsService,
    ErrorService,
    NumberFormat
} from '../../../../services/services';

export class BalanceSummaryData {
    public isAccount: boolean;
    public id: number;
    public number: number;
    public name: string;
    public amountIBPeriod1: number = 0;
    public amountChangePeriod1: number = 0;
    public amountOBPeriod1: number = 0;
    public amountIBPeriod2: number = 0;
    public amountChangePeriod2: number = 0;
    public amountOBPeriod2: number = 0;
    public rowCount: number = 0;
    public children: BalanceSummaryData[] = [];
    public parent: BalanceSummaryData;
    public expanded: boolean = false;
    public level: number = 0;
}

@Component({
    selector: 'drilldown-balance-report-part',
    templateUrl: './drilldownBalanceReportPart.html',
})
export class DrilldownBalanceReportPart implements OnChanges {
    @Input() public periodFilter1: PeriodFilter;
    @Input() public periodFilter2: PeriodFilter;
    @Input() private filter: any;

    public treeSummaryList: BalanceSummaryData[] = [];
    private flattenedTreeSummaryList: BalanceSummaryData[] = [];
    private showPreviousAccountYear: boolean = true;
    private numberFormat: INumberOptions = {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        decimalLength: 0
    };

    constructor(
        private statisticsService: StatisticsService,
        private accountGroupService: AccountGroupService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat,
        private modalService: UniModalService
    ) {
    }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
        }

        if (this.periodFilter1 && this.periodFilter2) {
            this.loadData();
        }
    }

    private expandRow(summaryData: BalanceSummaryData) {

        if (summaryData.isAccount) {
            const data: IDetailsModalInput = {
                modalMode: true,
                accountID: summaryData.id,
                subaccountID: null,
                accountName: summaryData.name,
                accountNumber: summaryData.number,
                dimensionType: null,
                dimensionId: null,
                periodFilter1: this.periodFilter1,
                periodFilter2: this.periodFilter2,
                close: null,
                filter: null
            };
            this.modalService.open(AccountDetailsReportModal, { data: data });

        } else {
            summaryData.expanded = !summaryData.expanded;

            if (summaryData.expanded) {
                const index = this.flattenedTreeSummaryList.indexOf(summaryData);
                if (summaryData.children.length > 0) {
                    const childrenWithData = summaryData.children.filter(
                        x => x.rowCount > 0 || x.amountIBPeriod1 !== 0 || x.amountIBPeriod2 !== 0
                    );
                    this.flattenedTreeSummaryList = this.flattenedTreeSummaryList
                        .slice( 0, index + 1 )
                        .concat( childrenWithData )
                        .concat( this.flattenedTreeSummaryList.slice( index + 1 ));
                }
            } else {
                // hide child and subchildren if multiple levels are expanded
                const childrenWithData = this.getChildrenWithDataDeep(summaryData);
                this.flattenedTreeSummaryList = this.flattenedTreeSummaryList.filter(
                    x => !childrenWithData.find(y => x === y)
                );
            }
        }
    }

    private getChildrenWithDataDeep(summaryData: BalanceSummaryData) {
        let children = summaryData.children.filter(
            x => x.rowCount > 0 || x.amountIBPeriod1 !== 0 || x.amountIBPeriod2 !== 0
        );

        children.forEach(child => {
            children = children.concat(this.getChildrenWithDataDeep(child));
        });

        return children;
    }

    private loadData() {
        const period1FilterExpression = `Period.AccountYear eq ${this.periodFilter1.year} `
            + `and Period.No ge ${this.periodFilter1.fromPeriodNo} and Period.No le ${this.periodFilter1.toPeriodNo}`;
        const period2FilterExpression = `Period.AccountYear eq ${this.periodFilter2.year} `
            + `and Period.No ge ${this.periodFilter2.fromPeriodNo} and Period.No le ${this.periodFilter2.toPeriodNo}`;
        const period1IBFilterExpression = `(Period.AccountYear eq ${this.periodFilter1.year} `
            + `and Period.No lt ${this.periodFilter1.fromPeriodNo}) `
            + `or (Period.AccountYear lt ${this.periodFilter1.year})`;
        const period2IBFilterExpression = `(Period.AccountYear eq ${this.periodFilter2.year} `
            + `and Period.No lt ${this.periodFilter2.fromPeriodNo}) `
            + `or (Period.AccountYear lt ${this.periodFilter2.year})`;
        const projectFilter = this.filter && this.filter.ProjectID
            ? ` and isnull(Dimensions.ProjectID,0) eq ${this.filter.ProjectID}`
            : '';
        const departmentFilter = this.filter && this.filter.DepartmentID
            ? ` and isnull(Dimensions.DepartmentID,0) eq ${this.filter.DepartmentID}`
            : '';

        Observable.forkJoin(
            this.statisticsService.GetAll(
                'model=AccountGroup&select=AccountGroup.ID as ID,AccountGroup.GroupNumber as GroupNumber,'
                + 'AccountGroup.Name as Name,AccountGroup.MainGroupID as MainGroupID'
                + '&orderby=AccountGroup.MainGroupID asc'
            ),
            this.statisticsService.GetAll(
                'model=Account&expand=TopLevelAccountGroup&filter=TopLevelAccountGroup.GroupNumber le 2'
                + '&select=Account.ID as ID,Account.AccountNumber as AccountNumber,'
                + 'Account.AccountName as AccountName,Account.AccountGroupID as AccountGroupID'
            ),
            this.statisticsService.GetAll(
                `model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions`
                + `&filter=TopLevelAccountGroup.GroupNumber le 2${projectFilter}${departmentFilter}`
                + `&select=JournalEntryLine.AccountID as AccountID,`
                + `sum(casewhen((${period1FilterExpression}) `
                + `or (${period2FilterExpression})\\,1\\,0)) as CountEntries,`
                + `sum(casewhen(${period1FilterExpression}\\,JournalEntryLine.Amount\\,0)) as amountChangePeriod1,`
                + `sum(casewhen(${period1IBFilterExpression}\\,JournalEntryLine.Amount\\,0)) as amountIBPeriod1,`
                + `sum(casewhen(${period2FilterExpression}\\,JournalEntryLine.Amount\\,0)) as amountChangePeriod2,`
                + `sum(casewhen(${period2IBFilterExpression}\\,JournalEntryLine.Amount\\,0)) as amountIBPeriod2`
            )
        ).subscribe(data => {
            const accountGroups = data[0].Data;
            const accounts = data[1].Data;
            const journalEntries = data[2].Data;

            const summaryDataList: BalanceSummaryData[] = [];
            const treeSummaryList: BalanceSummaryData[] = [];

            // build treestructure and calculations based on groups and accounts
            accountGroups.forEach(group => {
                if (group.GroupNumber && parseInt(group.GroupNumber.toString().substring(0, 1), 10) <= 2) {

                    const summaryData: BalanceSummaryData = new BalanceSummaryData();

                    summaryData.isAccount = false;
                    summaryData.name = group.Name;
                    summaryData.number = parseInt(group.GroupNumber, 10);
                    summaryData.id = group.ID;

                    if (group.MainGroupID) {
                        const mainGroupSummaryData: BalanceSummaryData = summaryDataList.find(
                            x => !x.isAccount && x.id === group.MainGroupID
                        );

                        if (mainGroupSummaryData) {
                            summaryData.parent = mainGroupSummaryData;
                            summaryData.level = mainGroupSummaryData.level + 1;

                            if (!this.shouldSkipGroupLevel(summaryData.number)) {
                                mainGroupSummaryData.children.push(summaryData);
                            }
                        }
                    } else {
                        summaryData.name = this.accountGroupService.getTopLevelGroupName(summaryData.number);
                    }

                    const accountsForGroup = accounts.filter(x => x.AccountGroupID === group.ID);

                    accountsForGroup.forEach(account => {
                        const accountSummaryData: BalanceSummaryData = new BalanceSummaryData();
                        accountSummaryData.isAccount = true;
                        accountSummaryData.name = account.AccountName;
                        accountSummaryData.number = account.AccountNumber;
                        accountSummaryData.id = account.ID;

                        const accountJournalEntryData = journalEntries.find(x => x.AccountID === account.ID);

                        if (accountJournalEntryData) {
                            accountSummaryData.amountIBPeriod1 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.amountIBPeriod1 * -1
                                : accountJournalEntryData.amountIBPeriod1;
                            accountSummaryData.amountChangePeriod1 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.amountChangePeriod1 * -1
                                : accountJournalEntryData.amountChangePeriod1;
                            accountSummaryData.amountOBPeriod1 = accountSummaryData.amountIBPeriod1
                                + accountSummaryData.amountChangePeriod1;
                            accountSummaryData.amountIBPeriod2 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.amountIBPeriod2 * -1
                                : accountJournalEntryData.amountIBPeriod2;
                            accountSummaryData.amountChangePeriod2 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.amountChangePeriod2 * -1
                                : accountJournalEntryData.amountChangePeriod2;
                            accountSummaryData.amountOBPeriod2 = accountSummaryData.amountIBPeriod2
                                + accountSummaryData.amountChangePeriod2;
                            accountSummaryData.rowCount = accountJournalEntryData.CountEntries;
                        }

                        // only show account if we have any data - i.e. either the IB has a value, or there are
                        // transactions in the periods
                        if (accountSummaryData.rowCount !== 0
                            || accountSummaryData.amountIBPeriod1 !== 0
                            || accountSummaryData.amountIBPeriod2 !== 0) {
                            if (this.shouldSkipGroupLevel(summaryData.number)) {
                                accountSummaryData.parent = summaryData.parent;
                                summaryData.parent.children.push(accountSummaryData);
                            } else {
                                accountSummaryData.parent = summaryData;
                                summaryData.children.push(accountSummaryData);
                            }

                            accountSummaryData.level = accountSummaryData.parent.level + 1;
                        }
                    });

                    summaryDataList.push(summaryData);

                    if (summaryData.level === 0) {
                        treeSummaryList.push(summaryData);
                    }
                }
            });

            // iterate and calculate sums for groups
            this.calculateTreeAmounts(treeSummaryList);

            // filter out rows that are not interesting to show. Set both the full tree and a copy we can
            // manipulate to show drilldown data
            this.flattenedTreeSummaryList = treeSummaryList.concat();

            // expand top level groups
            this.expandRow(this.flattenedTreeSummaryList[1]);
            this.expandRow(this.flattenedTreeSummaryList[0]);
        }, err => this.errorService.handle(err));
    }

    private calculateTreeAmounts(treeList: BalanceSummaryData[]) {
        treeList.forEach(treeNode => {
            if (treeNode.children.length > 0) {
                this.calculateTreeAmounts(treeNode.children);
            }

            if (treeNode.parent) {
                treeNode.parent.amountIBPeriod1 += treeNode.amountIBPeriod1;
                treeNode.parent.amountChangePeriod1 += treeNode.amountChangePeriod1;
                treeNode.parent.amountOBPeriod1 += treeNode.amountOBPeriod1;
                treeNode.parent.amountIBPeriod2 += treeNode.amountIBPeriod2;
                treeNode.parent.amountChangePeriod2 += treeNode.amountChangePeriod2;
                treeNode.parent.amountOBPeriod2 += treeNode.amountOBPeriod2;
                treeNode.parent.rowCount += treeNode.rowCount;
            }
        });
    }

    private shouldTurnAmount(groupNumber): boolean {
        if (groupNumber.toString().substring(0, 1) === '2') {
            return true;
        }

        return false;
    }

    private shouldSkipGroupLevel(groupNumber): boolean {
        if (groupNumber.toString().length === 3) {
            return true;
        }

        return false;
    }

    public getPaddingLeft(level) {
        if (level > 0) {
            return (level * 15).toString() + 'px';
        }
    }
}
