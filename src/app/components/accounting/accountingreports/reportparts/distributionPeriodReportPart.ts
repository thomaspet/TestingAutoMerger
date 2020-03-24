import {
    Component,
    Input,
    Output,
    OnChanges,
    EventEmitter,
    Pipe,
    PipeTransform,
    ViewChild,
    ElementRef
} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {INumberFormat} from '../../../../../framework/ui/unitable/index';
import {
    StatisticsService,
    DimensionService,
    ErrorService,
    NumberFormat,
    BudgetService
} from '../../../../services/services';
import {UniModalService} from '@uni-framework/uni-modal';
import {UniBudgetEntryEditModal} from '../../budget/budgetEntryEditModal';
import * as moment from 'moment';
import * as Chart from 'chart.js';

export class DistributionPeriodData {
    public periodNo: number;
    public periodName: string;
    public amountPeriodYear1: number;
    public amountPeriodYear2: number;
    public budgetPeriodYear1?: number;
    public budgetPeriodYear2?: number;
    public balance1?: string;
    public balance2?: string;
    public percentage1?: number | string;
    public percentage2?: number | string;
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
    @ViewChild('chartElement', { static: true }) chartElement: ElementRef;

    @Input() public accountYear1: any;
    @Input() public accountYear2: any;
    @Input() private accountIDs: number[];
    @Input() private subaccountIDs: number[];
    @Input() public showHeader: boolean = false;
    @Input() private doTurnAmounts: boolean = false;
    @Input() private showCredited: boolean = false;
    @Input() public activeDistributionElement: string;
    @Input() private dimensionType: number;
    @Input() private dimensionId: number;
    @Input() private includeIncomingBalance: boolean = false;
    @Input() filter: any;
    @Input() toPeriod: any;
    @Input() fromPeriod: any;

    @Output() private periodSelected: EventEmitter<Period> = new EventEmitter();
    @Output() private yearChange: EventEmitter<boolean> = new EventEmitter();

    public distributionPeriodData: Array<DistributionPeriodData> = [];
    private dimensionEntityName: string;
    private showPercent: boolean = true;
    private showPreviousAccountYear: boolean = true;
    public currentPeriode: number;
    public currentIndex: number;
    private isShiftDown: boolean;
    private numberFormat: INumberFormat = {
        thousandSeparator: ' ',
        decimalSeparator: '.',
        decimalLength: 0
    };

    private colors: Array<string> = ['#7293CB', '#84BA5B', '#db9645', '#cb5d5e'];
    chartRef: any;
    public initial: boolean = true;
    public budgets: any[];
    public budgetEntries1: any[];
    public budgetEntries2: any[];
    public hasBudgetYear1: boolean = false;
    public hasBudgetYear2: boolean = false;


    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private budgetService: BudgetService,
        private modalService: UniModalService,
        private router: Router,
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
        if (!this.fromPeriod) {
            this.fromPeriod = 1;
        }
        if (!this.toPeriod) {
            this.fromPeriod = 12;
        }

        if (this.filter) {
            this.numberFormat.decimalLength = this.filter.Decimals ? this.filter.Decimals : 0;
            this.showPercent = this.filter.ShowPercent;
            this.showPreviousAccountYear = this.filter.ShowPreviousAccountYear;
        }

        if (this.dimensionType) {
            this.dimensionEntityName = DimensionService.getEntityNameFromDimensionType(this.dimensionType);
        }

        if (this.initial) {
            this.budgetService.GetAll(null).subscribe(res => {
                this.budgets = res;
                this.loadData();
            }, err => {
                this.errorService.handle('Kunne ikke hente budsjett-data.');
                this.loadData();
            });
        } else {
            this.loadData();
        }
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

        let accountIdFilter = '';

        if (this.accountIDs && this.accountIDs.length > 0) {
            accountIdFilter = ' (Account.ID eq ' + this.accountIDs.join(' or Account.ID eq ') + ') ';
        }

        if (this.subaccountIDs && this.subaccountIDs.length > 0 ) {
            accountIdFilter = ' (SubAccount.ID eq ' + this.subaccountIDs.join(' or SubAccount.ID eq ') + ') ';
        }

        if (this.accountYear1 && this.accountYear2) {
            if (!accountIdFilter) {
                accountIdFilter = 'TopLevelAccountGroup.GroupNumber ge 3';
            }

            const dimensionFilter = this.dimensionEntityName
                ? ` and isnull(Dimensions.${this.dimensionEntityName}ID,0) eq ${this.dimensionId}`
                : '';
            const projectFilter = this.filter && (this.filter.ProjectID || this.filter.ProjectNumber)
                ? ` and isnull(Dimensions.ProjectID,0) eq ${this.filter.ProjectID || this.filter.ProjectNumber}`
                : '';
            const departmentFilter = this.filter && (this.filter.DepartmentID || this.filter.DepartmentNumber)
                ? ` and isnull(Dimensions.DepartmentID,0) eq ${this.filter.DepartmentID || this.filter.DepartmentNumber}`
                : '';

            const creditedFilter = !this.showCredited ? ` and isnull(StatusCode,0) ne '31004'` : '';

            const periodQuery = 'model=JournalEntryLine&expand=Period,SubAccount,Account.TopLevelAccountGroup,Dimensions'
                + `&filter=${accountIdFilter}${dimensionFilter}${projectFilter}${departmentFilter}${creditedFilter} and `
                + `(Period.No ge ${this.fromPeriod} and Period.No le ${this.toPeriod}) and `
                + `(Period.AccountYear eq ${this.accountYear1} or Period.AccountYear eq ${this.accountYear2})`
                + `&orderby=Period.AccountYear,Period.No&select=Period.AccountYear as PeriodAccountYear,`
                + `Period.No as PeriodNo,sum(JournalEntryLine.Amount) as SumAmount`;

            let subject = null;

            let budgetquery1 = Observable.of(null);
            let budgetquery2 = Observable.of(null);

            this.hasBudgetYear1 = false;
            this.hasBudgetYear2 = false;

            if (this.budgets.length && this.accountIDs && this.accountIDs.length) {
                if (this.budgets.filter(bud => bud.AccountingYear === parseInt(this.accountYear1, 10) && bud.StatusCode === 47002).length) {
                    const budget = this.budgets.filter(bud => bud.AccountingYear === parseInt(this.accountYear1, 10));

                    budgetquery1 = this.budgetService.getEntriesFromDepartmentNumber(
                        budget[0].ID,
                        this.accountIDs[0],
                        this.filter && (this.filter.DepartmentNumber || this.filter.DepartmentNumber === 0)
                        ? this.filter.DepartmentNumber : null);
                }

                if (this.budgets.filter(bud => bud.AccountingYear === parseInt(this.accountYear2, 10) && bud.StatusCode === 47002).length) {
                    const budget = this.budgets.filter(bud => bud.AccountingYear === parseInt(this.accountYear2, 10));
                    budgetquery2 = this.budgetService.getEntriesFromDepartmentNumber(
                        budget[0].ID,
                        this.accountIDs[0],
                        this.filter && (this.filter.DepartmentNumber || this.filter.DepartmentNumber === 0)
                        ? this.filter.DepartmentNumber : null);
                }
            }

            if (this.includeIncomingBalance) {
                subject = Observable.forkJoin(
                    this.statisticsService.GetAll(periodQuery),
                    this.statisticsService.GetAll('model=JournalEntryLine&expand=Period,SubAccount,Account.TopLevelAccountGroup,'
                    + `Dimensions&filter=${accountIdFilter}${dimensionFilter}${projectFilter}${departmentFilter} `
                    + `and (Period.No ge ${this.fromPeriod} and Period.No le ${this.toPeriod})`
                    + `&select=sum(casewhen(Period.AccountYear lt ${this.accountYear1}\\,`
                    + `JournalEntryLine.Amount\\,0)) as SumIBPeriod1,sum(casewhen(Period.AccountYear `
                    + `lt ${this.accountYear2}\\,JournalEntryLine.Amount\\,0)) as SumIBPeriod2`),                   //
                    budgetquery1,
                    budgetquery2
                    );
            } else {
                // dont ask for incoming balances if they aren't going to be displayed anyway
                subject = Observable.forkJoin(
                    this.statisticsService.GetAll(periodQuery),
                    Observable.of(null),
                    budgetquery1,
                    budgetquery2
                );
            }

            subject.subscribe((data: Array<any>) => {

                const periodDataUnordered = data[0].Data;

                // setup distributionperiods
                for (let i = 1; i <= 12; i++) {
                    distributionPeriodData.push({
                        periodNo: i,
                        periodName: moment().month(i - 1).format('MMMM'),
                        amountPeriodYear1: 0,
                        amountPeriodYear2: 0,
                        budgetPeriodYear1: 0,
                        budgetPeriodYear2: 0,
                    });
                }

                this.budgetEntries1 = data[2];
                this.budgetEntries2 = data[3];

                if (this.budgetEntries1 && this.budgetEntries1.length) {
                    this.hasBudgetYear1 = true;
                    distributionPeriodData.map(dist => { dist.budgetPeriodYear1 = 0; return dist; });

                    this.budgetEntries1.forEach(bud => {
                        distributionPeriodData[bud.PeriodNumber - 1].budgetPeriodYear1 +=
                            bud.Amount * (this.doTurnAmounts ? -1 : 1);
                    });
                }

                if (this.budgetEntries2 && this.budgetEntries2.length) {
                    this.hasBudgetYear2 = true;
                    distributionPeriodData.map(dist => { dist.budgetPeriodYear2 = 0; return dist; });
                    this.budgetEntries2.forEach(bud => {
                        distributionPeriodData[bud.PeriodNumber - 1].budgetPeriodYear2 +=
                            bud.Amount * (this.doTurnAmounts ? -1 : 1);
                    });
                }

                let totalEachMonth1 = 0;
                let totalEachMonth2 = 0;

                if (this.includeIncomingBalance && data[1]) {
                    const incomingBalanceDistributionData = {
                        periodNo: 0,
                        periodName: 'Inngående balanse',
                        amountPeriodYear1: !this.doTurnAmounts
                            ? data[1].Data[0].SumIBPeriod1
                            : data[1].Data[0].SumIBPeriod1 * -1,
                        amountPeriodYear2: !this.doTurnAmounts
                            ? data[1].Data[0].SumIBPeriod2
                            : data[1].Data[0].SumIBPeriod2 * -1,
                        balance1: this.numberFormatService.asMoney(data[1].Data[0].SumIBPeriod1),
                        balance2: this.numberFormatService.asMoney(data[1].Data[0].SumIBPeriod2)
                    };

                    distributionPeriodData.unshift(incomingBalanceDistributionData);
                    totalEachMonth1 = data[1].Data[0].SumIBPeriod1;
                    totalEachMonth2 = data[1].Data[0].SumIBPeriod2;
                }

                // set real amounts based on feedback from API
                periodDataUnordered.forEach((item) => {
                    const periodData = distributionPeriodData.find(x => x.periodNo === item.PeriodNo);
                    if (periodData) {
                        if (item.PeriodAccountYear === this.accountYear1) {
                            totalEachMonth1 += item.SumAmount;
                            periodData.amountPeriodYear1 = !this.doTurnAmounts ? item.SumAmount : item.SumAmount * -1;
                            periodData.balance1 = this.numberFormatService.asMoney(totalEachMonth1);
                        } else {
                            totalEachMonth2 += item.SumAmount;
                            periodData.amountPeriodYear2 = !this.doTurnAmounts ? item.SumAmount : item.SumAmount * -1;
                            periodData.balance2 = this.numberFormatService.asMoney(totalEachMonth2);
                        }
                    }
                });

                const sumDistributionData = {
                    periodNo: 13,
                    periodName: this.includeIncomingBalance ? 'Utgående balanse' : 'Totalt',
                    amountPeriodYear1: distributionPeriodData.reduce((a, b) => a + b.amountPeriodYear1, 0),
                    amountPeriodYear2:  distributionPeriodData.reduce((a, b) => a + b.amountPeriodYear2, 0),
                    budgetPeriodYear1:  distributionPeriodData.reduce((a, b) => a + b.budgetPeriodYear1, 0),
                    budgetPeriodYear2:  distributionPeriodData.reduce((a, b) => a + b.budgetPeriodYear2, 0)
                };
                distributionPeriodData.push(sumDistributionData);
                distributionPeriodData = distributionPeriodData.map(item => {
                    item.percentage1 =
                        item.budgetPeriodYear1 === 0
                            ? 0
                            : this.numberFormatService.asPercentage((item.amountPeriodYear1 / item.budgetPeriodYear1) * 100, {decimalLength: 2});
                    item.percentage2 =
                        item.budgetPeriodYear2 === 0
                            ? 0
                            : this.numberFormatService.asPercentage((item.amountPeriodYear2 / item.budgetPeriodYear2) * 100, {decimalLength: 2});
                    return item;
                });
                console.log(distributionPeriodData);
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

    public onBudgetCellClick(entryListNumber: number) {
        let entries;

        if (entryListNumber === 1) {
            entries = this.budgetEntries1;
        } else {
            entries = this.budgetEntries2;
        }

        const budget = this.budgets.filter(bud => bud.ID === entries[0].BudgetID)[0];

        if (!budget) {
            // Failcheck, something went wrong
            return;
        }

        this.modalService.open(UniBudgetEntryEditModal,
            {
                data: {
                    BudgetID: entries[0].ID,
                    entries: entries,
                    department: (this.filter && this.filter.DepartmentID) ? this.filter.DepartmentID : null,
                    departments: [],
                    fromResult: true
                }
            }).onClose.subscribe((result) => {
                if (result && result.length) {
                    budget.entries = result;
                    this.budgetService.Put(budget.ID, budget).subscribe((response) => {
                        this.loadData();
                    });
                }
            });
    }

    public goToBudget(year) {
        const budget = this.budgets.filter(bud => bud.AccountingYear === parseInt(year, 10) && bud.StatusCode === 47002)[0];
        if (!budget) {
            // Failcheck, something went wrong
            return;
        }

        this.router.navigateByUrl(`/accounting/budget?id=${budget.ID}`);
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
        const labels = [];
        const dataSets = [];

        dataSets.push({
            label: this.accountYear2.toString(),
            data: [],
            backgroundColor: this.colors[1],
            borderColor: this.colors[1],
            fill: false,
            lineTension: 0,
            borderWidth: 2
        });

        let prevYearData, budgetYear2Data, budgetYear1Data;

        if (this.showPreviousAccountYear) {
            prevYearData = {
                label: this.accountYear1.toString(),
                data: [],
                backgroundColor: this.colors[0],
                borderColor: this.colors[0],
                fill: false,
                lineTension: 0,
                borderWidth: 2
            };
        }

        if (this.hasBudgetYear2) {
            budgetYear2Data = {
                label: 'Budsjett - ' + this.accountYear2.toString(),
                data: [],
                backgroundColor: this.colors[2],
                borderColor: this.colors[2],
                fill: false,
                lineTension: 0,
                borderWidth: 2
            };
        }

        if (this.hasBudgetYear1) {
            budgetYear1Data = {
                label: 'Budsjett - ' + this.accountYear1.toString(),
                data: [],
                backgroundColor: this.colors[3],
                borderColor: this.colors[3],
                fill: false,
                lineTension: 0,
                borderWidth: 2
            };
        }

        for (let i = 0; i < this.distributionPeriodData.length; i++) {
            if (this.distributionPeriodData[i].periodNo >= 1 && this.distributionPeriodData[i].periodNo <= 12) {
                labels.push(this.distributionPeriodData[i].periodName.substr(0, 3));
                dataSets[0].data.push(this.distributionPeriodData[i].amountPeriodYear2);
                if (prevYearData) {
                    prevYearData.data.push(this.distributionPeriodData[i].amountPeriodYear1);
                }

                if (budgetYear2Data) {
                    budgetYear2Data.data.push(this.distributionPeriodData[i].budgetPeriodYear2 || 0);
                }

                if (budgetYear1Data) {
                    budgetYear1Data.data.push(this.distributionPeriodData[i].budgetPeriodYear1 || 0);
                }
            }
        }

        if (prevYearData) {
            dataSets.push(prevYearData);
        }

        if (budgetYear2Data) {
            dataSets.push(budgetYear2Data);
        }

        if (budgetYear1Data) {
            dataSets.push(budgetYear1Data);
        }

        const chartConfig = {
            label: '',
            labels: labels,
            chartType: 'line',
            borderColor: null,
            backgroundColor: null,
            datasets: dataSets,
            data: null
        };

        if (this.chartRef && this.chartRef.destroy) {
            this.chartRef.destroy();
        }

        if (this.chartElement && this.chartElement.nativeElement) {
            this.chartRef = new Chart(this.chartElement.nativeElement, {
                type: 'line',
                data: {
                    labels: chartConfig.labels,
                    datasets: chartConfig.datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }
}
