import {
    Component,
    Input,
    Output,
    OnChanges,
    EventEmitter,
    Pipe,
    PipeTransform
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {INumberFormat} from '../../../../../framework/ui/unitable/index';
import {ChartHelper} from '../chartHelper';
import {
    StatisticsService,
    DimensionService,
    ErrorService,
    NumberFormat
} from '../../../../services/services';
import * as moment from 'moment';

export class DistributionPeriodData {
    public periodNo: number;
    public periodName: string;
    public amountPeriodYear1: number;
    public amountPeriodYear2: number;
}

export class Period {
    public periodNo: number;
    public year: number;
}

@Pipe({
    name: 'numberAsMoney'
})
export class NumberAsMoneyPipe implements PipeTransform {

    public transform(value: any, options: INumberFormat) {
        if (!value) {
             return '';
        }
        let stringValue = value.toString().replace(',', '.');
        stringValue = parseFloat(stringValue).toFixed(options.decimalLength);

        let [integer, decimal] = stringValue.split('.');
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);

        stringValue = decimal ? (integer + options.decimalSeparator + decimal) : integer;

        return stringValue;
    }
}

@Component({
    selector: 'distribution-period-report-part',
    templateUrl: './distributionPeriodReportPart.html',
})
export class DistributionPeriodReportPart implements OnChanges {
    @Input() private accountYear1: number;
    @Input() private accountYear2: number;
    @Input() private accountIDs: number[];
    @Input() public showHeader: boolean = false;
    @Input() private doTurnAmounts: boolean = false;
    @Input() public activeDistributionElement: string;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;
    @Input() private includeIncomingBalance: boolean = false;
    @Input() private filter: any;

    @Output() private periodSelected: EventEmitter<Period> = new EventEmitter();
    @Output() private yearChange: EventEmitter<boolean> = new EventEmitter();

    private distributionPeriodData: Array<DistributionPeriodData> = [];
    private dimensionEntityName: string;
    private showPercent: boolean = true;
    private showPreviousAccountYear: boolean = true;
    private currentPeriode: number;
    private currentIndex: number;
    private isShiftDown: boolean;
    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 2
    };

    private colors: Array<string> = ['#7293CB', '#84BA5B'];

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private numberFormatService: NumberFormat
    ) {
        document.onkeydown = (e) => {
            if (e.keyCode === 16) {
                this.isShiftDown = true;
            }
        };

        document.onkeyup = (e) => {
            if (e.keyCode === 16) {
                this.isShiftDown = false;
            }
        };
    }

    public ngOnChanges() {
        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPercent = this.filter.ShowPercent;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
        }

        if (this.dimensionType) {
            this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
        }

        this.loadData();
    }

    public loadData() {
        // Angular needs to load the component before setting up
        // the tables or the dom (and the chart component) wont be ready
        setTimeout(() => {
            this.setupDistributionPeriodTable();
        });
    }

    private setupDistributionPeriodTable() {

        let distributionPeriodData: Array<DistributionPeriodData> = [];
        moment.locale();

        if (this.accountIDs && this.accountYear1 && this.accountYear2) {
            let accountIdFilter = this.accountIDs.length > 0
                ? ' (AccountID eq ' + this.accountIDs.join(' or AccountID eq ') + ') '
                : '';

            if (accountIdFilter === '') {
                accountIdFilter = 'TopLevelAccountGroup.GroupNumber ge 3';
            }

            let dimensionFilter = this.dimensionEntityName
                ? ` and isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.dimensionId}`
                : '';
            let projectFilter = this.filter && this.filter.ProjectID
                ? ` and isnull(Dimensions.ProjectID,0) eq ${this.filter.ProjectID}`
                : '';
            let departmentFilter = this.filter && this.filter.DepartmentID
                ? ` and isnull(Dimensions.DepartmentID,0) eq ${this.filter.DepartmentID}`
                : '';

            let periodQuery = 'model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,Dimensions'
                + `&filter=${accountIdFilter} ${dimensionFilter}${projectFilter}${departmentFilter} and `
                + `(Period.AccountYear eq ${this.accountYear1} or Period.AccountYear eq ${this.accountYear2})`
                + `&orderby=Period.AccountYear,Period.No&select=Period.AccountYear as PeriodAccountYear,`
                + `Period.No as PeriodNo,sum(JournalEntryLine.Amount) as SumAmount`;

            let subject = null;

            if (this.includeIncomingBalance) {
                subject = Observable.forkJoin(
                    this.statisticsService.GetAll(periodQuery),
                    this.statisticsService.GetAll('model=JournalEntryLine&expand=Period,Account.TopLevelAccountGroup,'
                    + `Dimensions&filter=${accountIdFilter} ${dimensionFilter}${projectFilter}${departmentFilter}`
                    + `&select=sum(casewhen(Period.AccountYear lt ${this.accountYear1}\\,`
                    + `JournalEntryLine.Amount\\,0)) as SumIBPeriod1,sum(casewhen(Period.AccountYear `
                    + `lt ${this.accountYear2}\\,JournalEntryLine.Amount\\,0)) as SumIBPeriod2`)                   //
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
                        amountPeriodYear1: !this.doTurnAmounts
                            ? data[1].Data[0].SumIBPeriod1
                            : data[1].Data[0].SumIBPeriod1 * -1,
                        amountPeriodYear2: !this.doTurnAmounts
                            ? data[1].Data[0].SumIBPeriod2
                            : data[1].Data[0].SumIBPeriod2 * -1
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

                this.setupDistributionPeriodChart();
            }, err => this.errorService.handle(err));
        }
    }

    public onCellClick(row: any, year: number, index: number) {
        // If not a month has been clicked, return
        if (row.periodNo === 0 || row.periodNo === 13) {
            return;
        }

        let periodeClicked = row.periodNo;

        // Makes sure that numbers are not marked as selected text
        document.getSelection().removeAllRanges();

        if (this.currentPeriode
            && (this.currentIndex || this.currentIndex === 0)
            && this.isShiftDown
            && this.currentPeriode !== periodeClicked) {
            if (this.currentPeriode > periodeClicked) {
                periodeClicked = (periodeClicked * 100) + this.currentPeriode;
                this.markSelection(index, this.currentIndex);
            } else {
                periodeClicked = (this.currentPeriode * 100) + periodeClicked;
                this.markSelection(this.currentIndex, index);
            }
        } else {
            this.markSelection(index, index);
        }

        // Check if SHIFT key is held down..
        this.periodSelected.emit({
            periodNo: periodeClicked,
            year: year
        });
        this.currentPeriode = row.periodNo;
        this.currentIndex = index;
    }

    private markSelection(startIndex: number, endIndex: number) {
        this.distributionPeriodData.map((row, index) => {
            row['_isSelected'] = index >= startIndex && index <= endIndex;
            return row;
         });
    }

    public onYearChange(previousYear: boolean) {
        this.yearChange.emit(previousYear);
    }

    private setupDistributionPeriodChart() {
        let labels = [];
        let dataSets = [];

        dataSets.push({
            label: this.accountYear2.toString(),
            data: [],
            backgroundColor: this.colors[1],
            borderColor: this.colors[1],
            fill: false,
            lineTension: 0,
            borderWidth: 2
        });

        if (this.showPreviousAccountYear) {
            dataSets.push({
                label: this.accountYear1.toString(),
                data: [],
                backgroundColor: this.colors[0],
                borderColor: this.colors[0],
                fill: false,
                lineTension: 0,
                borderWidth: 2
            });
        }

        for (var i = 0; i < this.distributionPeriodData.length; i++) {
            // don't include sums in the chart
            if (this.distributionPeriodData[i].periodNo >= 1 && this.distributionPeriodData[i].periodNo <= 12) {
                labels.push(this.distributionPeriodData[i].periodName);
                if (this.showPreviousAccountYear) {
                    dataSets[0].data.push(this.distributionPeriodData[i].amountPeriodYear2);
                    dataSets[1].data.push(this.distributionPeriodData[i].amountPeriodYear1);
                } else {
                    dataSets[0].data.push(this.distributionPeriodData[i].amountPeriodYear2);
                }
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
