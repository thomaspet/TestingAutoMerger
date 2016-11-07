import {Component, Input, ViewChild, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {AccountGroupService, StatisticsService} from '../../../../services/services';
import {DimensionService} from '../../../../services//common/DimensionService';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal} from '../detailsmodal/accountDetailsReportModal';

declare const moment;
declare const _; // lodash

export class ResultSummaryData {
    public isAccount: boolean;
    public id: number;
    public number: number;
    public name: string;
    public amountPeriod1: number = 0;
    public amountPeriod2: number = 0;
    public rowCount: number = 0;
    public percentagePeriod1: number = 0;
    public percentagePeriod2: number = 0;
    public children: ResultSummaryData[] = [];
    public parent: ResultSummaryData;
    public expanded: boolean = false;
    public level: number = 0;
}

@Component({
    selector: 'drilldown-result-report-part',
    templateUrl: 'app/components/accounting/accountingreports/reportparts/drilldownResultReportPart.html',
})
export class DrilldownResultReportPart implements OnChanges {

    @ViewChild(AccountDetailsReportModal) private accountDetailsReportModal: AccountDetailsReportModal;
    @Input() private periodFilter1: PeriodFilter;
    @Input() private periodFilter2: PeriodFilter;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;

    private dimensionEntityName: string;

    private treeSummaryList: ResultSummaryData[] = [];
    private flattenedTreeSummaryList: ResultSummaryData[] = [];

    constructor(private statisticsService: StatisticsService, private accountGroupService: AccountGroupService) {
    }

    public ngOnChanges() {
        if (this.periodFilter1 && this.periodFilter2) {
            if (this.dimensionType) {
                this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
            }

            this.loadData();
        }
    }

    private rowClicked(summaryData: ResultSummaryData) {
        if (summaryData.isAccount) {
            this.accountDetailsReportModal.open(summaryData.id, summaryData.number, summaryData.name, this.dimensionType, this.dimensionId);
        } else {
            summaryData.expanded = !summaryData.expanded;

            if (summaryData.expanded) {
                let index = this.flattenedTreeSummaryList.indexOf(summaryData);
                if (summaryData.children.length > 0) {
                    let childrenWithData = summaryData.children.filter(x => x.rowCount > 0);
                    this.flattenedTreeSummaryList = this.flattenedTreeSummaryList.slice( 0, index + 1 ).concat( childrenWithData ).concat( this.flattenedTreeSummaryList.slice( index + 1 ) );
                }
            } else {
                // hide child and subchildren if multiple levels are expanded
                let childrenWithData = this.getChildrenWithDataDeep(summaryData);
                this.flattenedTreeSummaryList = this.flattenedTreeSummaryList.filter(x => !childrenWithData.find(y => x === y));
            }
        }
    }

    private getChildrenWithDataDeep(summaryData: ResultSummaryData) {
        let children = summaryData.children.filter(x => x.rowCount > 0);

        children.forEach(child => {
            children = children.concat(this.getChildrenWithDataDeep(child));
        });

        return children;
    }

    private loadData() {
        let period1FilterExpression = `Period.AccountYear eq ${this.periodFilter1.year} and Period.No ge ${this.periodFilter1.fromPeriodNo} and Period.No le ${this.periodFilter1.toPeriodNo}`
        let period2FilterExpression = `Period.AccountYear eq ${this.periodFilter2.year} and Period.No ge ${this.periodFilter2.fromPeriodNo} and Period.No le ${this.periodFilter2.toPeriodNo}`
        let dimensionFilter = this.dimensionEntityName ? ` and isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.dimensionId}` : '';

        Observable.forkJoin(
            this.statisticsService.GetAll('model=AccountGroup&select=AccountGroup.ID as ID,AccountGroup.GroupNumber as GroupNumber,AccountGroup.Name as Name,AccountGroup.MainGroupID as MainGroupID&orderby=AccountGroup.MainGroupID asc'),
            this.statisticsService.GetAll('model=Account&expand=TopLevelAccountGroup&filter=TopLevelAccountGroup.GroupNumber ge 3&select=Account.ID as ID,Account.AccountNumber as AccountNumber,Account.AccountName as AccountName,Account.AccountGroupID as AccountGroupID'),
            this.statisticsService.GetAll(`model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions&filter=TopLevelAccountGroup.GroupNumber ge 3${dimensionFilter}&select=JournalEntryLine.AccountID as AccountID,sum(casewhen((${period1FilterExpression}) or (${period2FilterExpression})\\,1\\,0)) as CountEntries,sum(casewhen(${period1FilterExpression}\\,JournalEntryLine.Amount\\,0)) as SumAmountPeriod1,sum(casewhen(${period2FilterExpression}\\,JournalEntryLine.Amount\\,0)) as SumAmountPeriod2`)
        ).subscribe(data => {
            let accountGroups = data[0].Data;
            let accounts = data[1].Data;
            let journalEntries = data[2].Data;

            let summaryDataList: ResultSummaryData[] = [];
            let treeSummaryList: ResultSummaryData[] = [];

            // build treestructure and calculations based on groups and accounts
            accountGroups.forEach(group => {
                if (group.GroupNumber && parseInt(group.GroupNumber.toString().substring(0, 1)) > 2) {

                    let summaryData: ResultSummaryData = new ResultSummaryData();

                    summaryData.isAccount = false;
                    summaryData.name = group.Name;
                    summaryData.number = parseInt(group.GroupNumber);
                    summaryData.id = group.ID;

                    if (group.MainGroupID) {
                        let mainGroupSummaryData: ResultSummaryData = summaryDataList.find(x => !x.isAccount && x.id === group.MainGroupID);

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

                    let accountsForGroup = accounts.filter(x => x.AccountGroupID === group.ID);

                    accountsForGroup.forEach(account => {
                        let accountSummaryData: ResultSummaryData = new ResultSummaryData();
                        accountSummaryData.isAccount = true;
                        accountSummaryData.name = account.AccountName;
                        accountSummaryData.number = account.AccountNumber;
                        accountSummaryData.id = account.ID;

                        let accountJournalEntryData = journalEntries.find(x => x.AccountID === account.ID);
                        if (accountJournalEntryData) {
                            accountSummaryData.amountPeriod1 = this.shouldTurnAmount(accountSummaryData.number) ? accountJournalEntryData.SumAmountPeriod1 * -1 : accountJournalEntryData.SumAmountPeriod1;
                            accountSummaryData.amountPeriod2 = this.shouldTurnAmount(accountSummaryData.number) ? accountJournalEntryData.SumAmountPeriod2 * -1 : accountJournalEntryData.SumAmountPeriod2;
                            accountSummaryData.rowCount = accountJournalEntryData.CountEntries;
                        }

                        if (accountSummaryData.rowCount !== 0) {
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

                    if (!summaryData.parent) {
                        treeSummaryList.push(summaryData);
                    }
                }
            });

            // iterate and calculate sums for groups
            this.calculateTreeAmounts(treeSummaryList);

            // add result summarydata - TBD: BØR VI HA MED DENNE? HVA MED ÅRSAVSLUTNING/RESULTATDISPONERING?
            let resultNode: ResultSummaryData = {
                id: 0,
                number: 9,
                name: 'Resultat',
                parent: null,
                rowCount: 0,
                level: 0,
                children: [],
                isAccount: false,
                amountPeriod1: 0,
                amountPeriod2: 0,
                percentagePeriod1: 0,
                percentagePeriod2: 0,
                expanded: false
            };

            treeSummaryList.forEach(item => {
                if (item.number === 3) {
                    resultNode.amountPeriod1 += item.amountPeriod1;
                    resultNode.amountPeriod2 += item.amountPeriod2;
                } else {
                    resultNode.amountPeriod1 -= item.amountPeriod1;
                    resultNode.amountPeriod2 -= item.amountPeriod2;
                }
            });

            treeSummaryList.push(resultNode);

            // iterate and calculate percentages for groups based on total income
            this.calculateTreePercentages(treeSummaryList, null, null);

            // filter out rows that are not interesting to show. Set both the full tree and a copy we can
            // manipulate to show drilldown data
            this.treeSummaryList = treeSummaryList;
            this.flattenedTreeSummaryList = treeSummaryList.concat();
        });
    }

    private calculateTreeAmounts(treeList: ResultSummaryData[]) {
        treeList.forEach(treeNode => {
            if (!treeNode.isAccount) {
                treeNode.amountPeriod1 = 0;
                treeNode.amountPeriod2 = 0;
                treeNode.rowCount = 0;
            }

            if (treeNode.children.length > 0) {
                this.calculateTreeAmounts(treeNode.children);
            }

            if (treeNode.parent) {
                treeNode.parent.amountPeriod1 += treeNode.amountPeriod1;
                treeNode.parent.amountPeriod2 += treeNode.amountPeriod2;
                treeNode.parent.rowCount += treeNode.rowCount;
            }
        });
    }

    private calculateTreePercentages(treeList: ResultSummaryData[], totalAmountPeriod1: number, totalAmountPeriod2: number) {

        if (totalAmountPeriod1 == null || totalAmountPeriod2 == null) {
            let totalIncomeNode = treeList.find(x => x.number === 3);

            totalAmountPeriod1 = totalIncomeNode.amountPeriod1;
            totalAmountPeriod2 = totalIncomeNode.amountPeriod2;
        }

        treeList.forEach(treeNode => {
            treeNode.percentagePeriod1 = totalAmountPeriod1 !== 0 ? Math.round((treeNode.amountPeriod1 * 100) / totalAmountPeriod1) : 0;
            treeNode.percentagePeriod2 = totalAmountPeriod2 !== 0 ? Math.round((treeNode.amountPeriod2 * 100) / totalAmountPeriod2) : 0;

            if (treeNode.children.length > 0) {
                this.calculateTreePercentages(treeNode.children, totalAmountPeriod1, totalAmountPeriod2);
            }
        });
    }

    private shouldTurnAmount(groupNumber): boolean {
        if (groupNumber.toString().substring(0, 1) === '3') {
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

    private getPaddingLeft(level) {
        if (level > 0) {
            return (level * 15).toString() + 'px';
        }
    }
}
