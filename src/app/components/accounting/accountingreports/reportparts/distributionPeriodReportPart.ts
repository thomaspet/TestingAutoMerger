import {Component, ViewChild, Input, OnChanges} from '@angular/core';
import {StatisticsService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniTableColumn, UniTableConfig, UniTableColumnType, ITableFilter, UniTable} from 'unitable-ng2/main';
import {ChartHelper, IChartDataSet} from '../chartHelper';
import {Account, JournalEntryLine} from '../../../../unientities';
import {DimensionService} from '../../../../services//common/DimensionService';

declare const moment;

export class DistributionPeriodData {
    public periodNo: number;
    public periodName: string;
    public amountPeriodYear1: number;
    public amountPeriodYear2: number;
}

@Component({
    selector: 'distribution-period-report-part',
    templateUrl: 'app/components/accounting/accountingreports/reportparts/distributionPeriodReportPart.html',
})
export class DistributionPeriodReportPart implements OnChanges {

    @Input() private accountYear1: number;
    @Input() private accountYear2: number;
    @Input() private accountIDs: number[];
    @Input() private showHeader: boolean = false;
    @Input() private doTurnAmounts: boolean = false;
    @Input() private activeDistributionElement: string;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;
    @Input() private includeIncomingBalance: boolean = false;

    private uniTableConfigDistributionPeriod: UniTableConfig;
    private distributionPeriodData: Array<DistributionPeriodData> = [];
    private dimensionEntityName: string;

    private colors: Array<string> = ['#7293CB', '#84BA5B'];

    constructor(private statisticsService: StatisticsService) {
    }

    public ngOnChanges() {
        if (this.dimensionType) {
            this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
        }

        this.loadData();
    }

    public loadData() {
        // angular needs to load the component before setting up the tables or the dom (and the chart component) wont be ready
        setTimeout(() => {
            this.setupDistributionPeriodTable();
        });
    }

    private setupDistributionPeriodTable() {

        let distributionPeriodData: Array<DistributionPeriodData> = [];
        moment.locale();

        if (this.accountIDs && this.accountYear1 && this.accountYear2) {
            let accountIdFilter = this.accountIDs.length > 0 ? ' (AccountID eq ' + this.accountIDs.join(' or AccountID eq ') + ') ' : '';

            if (accountIdFilter === '') {
                accountIdFilter = 'TopLevelAccountGroup.GroupNumber ge 3';
            }

            let dimensionFilter = this.dimensionEntityName ? ` and isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.dimensionId}` : '';

            let periodQuery = 'model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions' +
                                      `&filter=${accountIdFilter} ${dimensionFilter} and (Period.AccountYear eq ${this.accountYear1} or Period.AccountYear eq ${this.accountYear2})` +
                                      '&orderby=Period.AccountYear,Period.No' +
                                      `&select=Period.AccountYear as PeriodAccountYear,Period.No as PeriodNo,sum(JournalEntryLine.Amount) as SumAmount`;

            let subject = null;

            if (this.includeIncomingBalance) {
                subject = Observable.forkJoin(
                    this.statisticsService.GetAll(periodQuery),
                    this.statisticsService.GetAll('model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions' +
                                        `&filter=${accountIdFilter} ${dimensionFilter}` +
                                        `&select=sum(casewhen(Period.AccountYear lt ${this.accountYear1}\\,JournalEntryLine.Amount\\,0)) as SumIBPeriod1,sum(casewhen(Period.AccountYear lt ${this.accountYear2}\\,JournalEntryLine.Amount\\,0)) as SumIBPeriod2`)                   //
                    );
            } else {
                // dont ask for incoming balances if they aren't going to be displayed anyway
                subject = Observable.forkJoin(
                    this.statisticsService.GetAll(periodQuery)
                );
            }

            subject.subscribe((data: Array<any>) => {
                let periodDataUnordered = data[0].Data;

                // setup distributionperiods
                for (let i = 1; i <= 12; i++) {
                    distributionPeriodData.push({
                        periodNo: i,
                        periodName: moment().month(i - 1).format('MMMM'),
                        amountPeriodYear1: 0,
                        amountPeriodYear2: 0
                    });
                }

                // set real amounts based on feedback from API
                periodDataUnordered.forEach((item) => {
                    let periodData = distributionPeriodData.find(x => x.periodNo === item.PeriodNo);
                    if (periodData) {
                        if (item.PeriodAccountYear === this.accountYear1) {
                            periodData.amountPeriodYear1 = !this.doTurnAmounts ? item.SumAmount : item.SumAmount * -1;
                        } else {
                            periodData.amountPeriodYear2 = !this.doTurnAmounts ? item.SumAmount : item.SumAmount * -1;
                        }
                    }
                });

                if (this.includeIncomingBalance) {
                    let incomingBalanceDistributionData = {
                        periodNo: 0,
                        periodName: 'Inngående balanse',
                        amountPeriodYear1: !this.doTurnAmounts ? data[1].Data[0].SumIBPeriod1 : data[1].Data[0].SumIBPeriod1 * -1,
                        amountPeriodYear2: !this.doTurnAmounts ? data[1].Data[0].SumIBPeriod2 : data[1].Data[0].SumIBPeriod2 * -1
                    };

                    distributionPeriodData.unshift(incomingBalanceDistributionData);
                }

                let sumDistributionData = {
                    periodNo: 13,
                    periodName: this.includeIncomingBalance ? 'Utgående balanse' : 'Totalt',
                    amountPeriodYear1: distributionPeriodData.reduce((a, b) => a + b.amountPeriodYear1, 0),
                    amountPeriodYear2:  distributionPeriodData.reduce((a, b) => a + b.amountPeriodYear2, 0)
                };

                distributionPeriodData.push(sumDistributionData);

                this.distributionPeriodData = distributionPeriodData;

                this.uniTableConfigDistributionPeriod = new UniTableConfig(false, false)
                    .setColumns([
                        new UniTableColumn('periodName', 'Periode', UniTableColumnType.Text).setWidth('50%'),
                        new UniTableColumn('amountPeriodYear1', this.accountYear1.toString(), UniTableColumnType.Money).setCls('amount'),
                        new UniTableColumn('amountPeriodYear2', this.accountYear2.toString(), UniTableColumnType.Money).setCls('amount')
                    ]);

                this.setupDistributionPeriodChart();
            });
        }
    }

    private setupDistributionPeriodChart() {
        let labels = [];
        let dataSets = [];

        dataSets.push({
            label: this.accountYear1.toString(),
            data: [],
            backgroundColor: this.colors[0],
            borderColor: this.colors[0],
            fill: false,
            lineTension: 0,
            borderWidth: 2
        });

        dataSets.push({
            label: this.accountYear2.toString(),
            data: [],
            backgroundColor: this.colors[1],
            borderColor: this.colors[1],
            fill: false,
            lineTension: 0,
            borderWidth: 2
        });

        for (var i = 0; i < this.distributionPeriodData.length; i++) {
            // don't include sums in the chart
            if (this.distributionPeriodData[i].periodNo >= 1 && this.distributionPeriodData[i].periodNo <= 12) {
                labels.push(this.distributionPeriodData[i].periodName);
                dataSets[0].data.push(this.distributionPeriodData[i].amountPeriodYear1);
                dataSets[1].data.push(this.distributionPeriodData[i].amountPeriodYear2);
            }
        }

        let chartConfig = {
            label: '',
            labels: labels,
            chartType: 'line',
            borderColor: null,
            backgroundColor: null,
            datasets: dataSets,
            data: null
        };

        ChartHelper.generateChart('accountDetailsReportPeriodDistributionChart', chartConfig);
    }
}
