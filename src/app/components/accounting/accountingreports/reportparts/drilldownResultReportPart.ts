import {Component, Input, OnChanges} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {PeriodFilter} from '../periodFilter/periodFilter';
import {AccountDetailsReportModal, IDetailsModalInput} from '../detailsmodal/accountDetailsReportModal';
import {UniModalService} from '../../../../../framework/uniModal/barrel';
import {
    UniTableColumn,
    UniTableConfig,
    UniTableColumnType,
    INumberFormat
} from '../../../../../framework/ui/unitable/index';
import {ChartHelper} from '../chartHelper';
import {
    AccountGroupService,
    StatisticsService,
    ErrorService,
    DimensionService,
    NumberFormat
} from '../../../../services/services';

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
    public turned: boolean = false;
}

@Component({
    selector: 'drilldown-result-report-part',
    templateUrl: './drilldownResultReportPart.html',
})
export class DrilldownResultReportPart implements OnChanges {
    @Input() private periodFilter1: PeriodFilter;
    @Input() private periodFilter2: PeriodFilter;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;
    @Input() private filter: any;

    private dimensionEntityName: string;
    private treeSummaryList: ResultSummaryData[] = [];
    private flattenedTreeSummaryList: ResultSummaryData[] = [];
    private uniTableConfig: UniTableConfig;
    private showPercent: boolean = true;
    private showPreviousAccountYear: boolean = true;
    private showall: boolean = false;
    private numberFormat: INumberFormat = {
        thousandSeparator: '',
        decimalSeparator: '.',
        decimalLength: 2
    };

    private colors: Array<string> = ['#7293CB', '#84BA5B', '#ff0000', '#00ff00', '#f0f000'];
    private percentagePeriod1: number = 0;

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
            this.showPercent = this.filter.ShowPercent;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
        }

        if (this.periodFilter1 && this.periodFilter2) {
            if (this.dimensionType) {
                this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
            }
        }

        this.loadData();
    }

    public toggleShowAll() {
        this.showall = !this.showall;
        if (this.showall) {
            this.flattenedTreeSummaryList.forEach(child => {
                this.expandChildren(child);
            });
        } else {
            this.flattenedTreeSummaryList = this.treeSummaryList.concat();
            this.flattenedTreeSummaryList.forEach(child => {
                child.expanded = false;
            });
        }
    }

    private expandChildren(child) {
        if (child.children.length > 0) {
            child.expanded = true;
            let index = this.flattenedTreeSummaryList.indexOf(child);
            let childrenWithData = child.children.filter(x => x.rowCount > 0);
            this.flattenedTreeSummaryList = this.flattenedTreeSummaryList
                .slice( 0, index + 1 )
                .concat( childrenWithData )
                .concat( this.flattenedTreeSummaryList.slice( index + 1 ) );
            child.children.forEach(subchild => {
                this.expandChildren(subchild);
            });
        }
    }

    public rowClicked(summaryData: ResultSummaryData) {
        if (summaryData.isAccount) {
            let data: IDetailsModalInput = {
                modalMode: true,
                accountID: summaryData.id,
                subaccountID: null,
                accountName: summaryData.name,
                accountNumber: summaryData.number,
                dimensionType: this.dimensionType,
                dimensionId: this.dimensionId,
                close: null
            };
            this.modalService.open(AccountDetailsReportModal, { data: data });
        } else {
            summaryData.expanded = !summaryData.expanded;

            if (summaryData.expanded) {
                let index = this.flattenedTreeSummaryList.indexOf(summaryData);
                if (summaryData.children.length > 0) {
                    let childrenWithData = summaryData.children.filter(x => x.rowCount > 0);
                    this.flattenedTreeSummaryList = this.flattenedTreeSummaryList
                        .slice( 0, index + 1 )
                        .concat( childrenWithData )
                        .concat( this.flattenedTreeSummaryList.slice( index + 1 ) );
                }
            } else {
                // hide child and subchildren if multiple levels are expanded
                let childrenWithData = this.getChildrenWithDataDeep(summaryData);
                this.flattenedTreeSummaryList = this.flattenedTreeSummaryList.filter(
                    x => !childrenWithData.find(y => x === y)
                );
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
        let period1FilterExpression = `Period.AccountYear eq ${this.periodFilter1.year} `
            + `and Period.No ge ${this.periodFilter1.fromPeriodNo} and Period.No le ${this.periodFilter1.toPeriodNo}`;
        let period2FilterExpression = `Period.AccountYear eq ${this.periodFilter2.year} `
            + `and Period.No ge ${this.periodFilter2.fromPeriodNo} and Period.No le ${this.periodFilter2.toPeriodNo}`;
        let dimensionFilter = this.dimensionEntityName
            ? ` and isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.dimensionId}`
            : '';
        let projectFilter = this.filter && this.filter.ProjectID
            ? ` and isnull(Dimensions.ProjectID,0) eq ${this.filter.ProjectID}`
            : '';
        let departmentFilter = this.filter && this.filter.DepartmentID
            ? ` and isnull(Dimensions.DepartmentID,0) eq ${this.filter.DepartmentID}`
            : '';

        Observable.forkJoin(
            this.statisticsService.GetAll(
                'model=AccountGroup&select=AccountGroup.ID as ID,AccountGroup.GroupNumber as GroupNumber'
                + ',AccountGroup.Name as Name,AccountGroup.MainGroupID as MainGroupID'
                + '&orderby=AccountGroup.MainGroupID asc'
            ),
            this.statisticsService.GetAll(
                'model=Account&expand=TopLevelAccountGroup&filter=TopLevelAccountGroup.GroupNumber ge 3'
                + '&select=Account.ID as ID,Account.AccountNumber as AccountNumber,'
                + 'Account.AccountName as AccountName,Account.AccountGroupID as AccountGroupID'
            ),
            this.statisticsService.GetAll(
                `model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions`
                + `&filter=TopLevelAccountGroup.GroupNumber ge 3${dimensionFilter}${projectFilter}${departmentFilter}`
                + `&select=JournalEntryLine.AccountID as AccountID,sum(casewhen((${period1FilterExpression}) `
                + `or (${period2FilterExpression})\\,1\\,0)) as CountEntries,`
                + `sum(casewhen(${period1FilterExpression}\\,JournalEntryLine.Amount\\,0)) as SumAmountPeriod1,`
                + `sum(casewhen(${period2FilterExpression}\\,JournalEntryLine.Amount\\,0)) as SumAmountPeriod2`
            )
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
                    summaryData.turned = this.shouldTurnAmount(summaryData.number);

                    if (group.MainGroupID) {
                        let mainGroupSummaryData: ResultSummaryData = summaryDataList.find(
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

                    let accountsForGroup = accounts.filter(x => x.AccountGroupID === group.ID);

                    accountsForGroup.forEach(account => {
                        let accountSummaryData: ResultSummaryData = new ResultSummaryData();
                        accountSummaryData.isAccount = true;
                        accountSummaryData.name = account.AccountName;
                        accountSummaryData.number = account.AccountNumber;
                        accountSummaryData.id = account.ID;
                        accountSummaryData.turned = this.shouldTurnAmount(accountSummaryData.number);

                        let accountJournalEntryData = journalEntries.find(x => x.AccountID === account.ID);
                        if (accountJournalEntryData) {
                            accountSummaryData.amountPeriod1 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.SumAmountPeriod1 * -1
                                : accountJournalEntryData.SumAmountPeriod1;
                            accountSummaryData.amountPeriod2 = this.shouldTurnAmount(accountSummaryData.number)
                                ? accountJournalEntryData.SumAmountPeriod2 * -1
                                : accountJournalEntryData.SumAmountPeriod2;
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
                expanded: false,
                turned: false
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
            this.percentagePeriod1 = treeSummaryList.find(x => x.number === 9).percentagePeriod1;

            // filter out rows that are not interesting to show. Set both the full tree and a copy we can
            // manipulate to show drilldown data
            this.treeSummaryList = treeSummaryList;
            this.flattenedTreeSummaryList = treeSummaryList.concat();

            this.setupTable();
            this.setupChart();

     }, err => this.errorService.handle(err));
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

    private calculateTreePercentages(
        treeList: ResultSummaryData[],
        totalAmountPeriod1: number,
        totalAmountPeriod2: number
    ) {

        if (totalAmountPeriod1 === null || totalAmountPeriod2 === null) {
            let totalIncomeNode = treeList.find(x => x.number === 3);

            totalAmountPeriod1 = totalIncomeNode.amountPeriod1;
            totalAmountPeriod2 = totalIncomeNode.amountPeriod2;
        }

        treeList.forEach(treeNode => {
            treeNode.percentagePeriod1 = totalAmountPeriod1 !== 0
                ? Math.round((treeNode.amountPeriod1 * 100) / totalAmountPeriod1)
                : 0;
            treeNode.percentagePeriod2 = totalAmountPeriod2 !== 0
                ? Math.round((treeNode.amountPeriod2 * 100) / totalAmountPeriod2)
                : 0;

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

    public getPaddingLeft(level) {
        if (level > 0) {
            return (level * 15).toString() + 'px';
        }
    }

    private setupTable() {
        this.uniTableConfig = new UniTableConfig('accounting.drilldownResultReportPart', false, false)
            .setColumnMenuVisible(true)
            .setColumns([
                new UniTableColumn('number', 'Konto/kontogruppe', UniTableColumnType.Text)
                    .setWidth('50%')
                    .setTemplate(item => item.number + ': ' + item.name),
                new UniTableColumn('amountPeriod1', this.periodFilter1.name, UniTableColumnType.Money)
                    .setWidth('20%').setCls('amount')
                    .setNumberFormat(this.numberFormat),
                new UniTableColumn('percentagePeriod1', '%', UniTableColumnType.Number)
                    .setWidth('5%')
                    .setCls('percentage'),
                new UniTableColumn('amountPeriod2', this.periodFilter2.name, UniTableColumnType.Money)
                    .setWidth('20%').setCls('percentage')
                    .setNumberFormat(this.numberFormat),
                new UniTableColumn('percentagePeriod2', '%', UniTableColumnType.Number)
                    .setWidth('5%')
                    .setCls('percentage'),
            ]);
    }

    private setupChart() {
        let dataSets = [];

        let sales = this.flattenedTreeSummaryList.find(x => x.number === 3);
        let salary = this.flattenedTreeSummaryList.find(x => x.number === 5);
        let other = this.flattenedTreeSummaryList.find(x => x.number === 7);
        let result = this.flattenedTreeSummaryList.find(x => x.number === 9);

        // amountPeriod1
        dataSets.push({
            label: this.periodFilter1.year,
            data: [],
            backgroundColor: this.colors[1],
            borderColor: this.colors[1],
            fill: true,
            borderWidth: 2
        });

        dataSets[0].data.push(
            sales.amountPeriod1,
            salary.amountPeriod1,
            other.amountPeriod1,
            result.amountPeriod1
        );

        // create datasets
        if (this.showPreviousAccountYear) {
            dataSets.push({
                label: this.periodFilter2.year,
                data: [],
                backgroundColor: this.colors[0],
                borderColor: this.colors[0],
                fill: true,
                borderWidth: 2
            });

            // amountPeriod2
            dataSets[1].data.push(
                sales.amountPeriod2,
                salary.amountPeriod2,
                other.amountPeriod2,
                result.amountPeriod2
            );
        }

        // Result
        let resulttext = result.amountPeriod1 > 0
            ? 'Overskudd'
            : (result.amountPeriod1 < 0 ? 'Underskudd' : 'Resultat');

        let chartConfig = {
            label: '',
            labels: ['Salgsinntekter', 'Lønnskostnad', 'Andre kostnader', resulttext],
            chartType: 'bar',
            borderColor: null,
            backgroundColor: null,
            datasets: dataSets,
            data: null
        };

        ChartHelper.generateChart('accountingReportDrilldownChart', chartConfig);
    }

    public profitMarginText() {
        // feks 20% og oppover gir visning av prosent og kommentaren:
        // Best, 10-20%: Svært godt, 5-10% Godt, 0-5% Bra, og under: Svak
        if (this.percentagePeriod1 >= 20) {
            return this.percentagePeriod1  + '% Best';
        } else if (this.percentagePeriod1 > 10) {
            return this.percentagePeriod1  + '% Svært godt';
        } else if (this.percentagePeriod1 > 5) {
            return this.percentagePeriod1 + '% Godt';
        } else if (this.percentagePeriod1 >= 0) {
            return this.percentagePeriod1 + '% Bra';
        } else {
            return this.percentagePeriod1 + '% Svak';
        }
    }
}
