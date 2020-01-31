import {Component, ViewChild, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Project, Customer} from '../../../../unientities';
import {
    ProjectService,
    CustomerService,
    StatisticsService,
    NumberFormat
} from '../../../../services/services';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import * as Chart from 'chart.js';
import * as moment from 'moment';
import {Observable} from 'rxjs';

export interface IMyProject extends Project {
    ProjectCustomerID: number;
}

interface IMonthAndYear {
    month: number;
    year: number;
}

@Component({
    selector: 'project-overview',
    templateUrl: './overview.html'
})

export class ProjectOverview {

    @ViewChild('chartElement1', { static: false })
    private chartElement1: ElementRef;

    private MONTHS: string[] = [
        'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember' ];

    private MONTHS_SHORT: string[] = [ 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des' ];

    private MONTHS_NUMERIC: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    private CUSTOM_COLORS = ['#E57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4DD0E1',
        '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFF176 ', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE'];

    chartFilters: any[] = [
        { name: 'Alt', value: '' },
        { name: 'I år', value: 'year(FinancialDate) eq ' + new Date().getFullYear() }
    ];

    currentChartFilter = this.chartFilters[0];

    chartTypeFilters: any[] = [
        { name: 'Resultat', ID: 1, value: 'default' },
        { name: 'Utgifter', ID: 2, value: 'expence' }
    ];

    currentChartDataTypeFilter = this.chartTypeFilters[0];

    private myChart: any;
    public projectHoursTotal: number;
    public projectHoursInvoiced: number;
    orderReserve: string = '0,00';
    resultSoFar: string = '0,00';
    currentChartData: any;

    public customerName: string;
    private monthAndYearDataInBarChart: IMonthAndYear[] = [];

    public project: IMyProject;
    private chart: any = {};

    constructor(
        public projectService: ProjectService,
        private customerService: CustomerService,
        private router: Router,
        private route: ActivatedRoute,
        private statisticsService: StatisticsService,
        private numberFormat: NumberFormat,
        private toast: ToastService) {
    }

    public ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            if (!this.projectService.currentProject.getValue()) {
                if (params && params['projectID']) {
                    this.projectService.Get(+params['projectID'],
                        ['ProjectTasks.ProjectTaskSchedules', 'ProjectResources'])
                    .subscribe((project: Project) => {
                        this.projectChanged(project);
                    });
                }
            } else {
                this.projectChanged(this.projectService.currentProject.getValue());
            }
        });
    }

    public ngAfterViewInit() {
        if (this.projectService.hasJournalEntryLineModule) {
            this.chartElement1.nativeElement.onclick = (event) => {
                const temp = this.myChart.getElementAtEvent(event);
                if (this.myChart && temp && temp.length) {
                    const project = this.projectService.currentProject.getValue();

                    const url = '/accounting/accountingreports/dimension?type=1'
                        + `&id=${project.ID}`
                        + `&number=${project.ProjectNumber}`
                        + `&name=${project.Name}`;

                    this.onNavigate(url);
                }
            };
        }
    }

    onNavigate(url, isChildRoute: boolean = false) {
        if (isChildRoute) {
            this.router.navigate([url], {
                relativeTo: this.route,
                queryParamsHandling: 'preserve'
            });
        } else {
            this.router.navigateByUrl(url);
        }
    }

    getQANClass(value: string, invert: boolean = false) {
        const numeric = parseInt(value, 10) * (invert ? -1 : 1);
        return  numeric > 0 ? 'good' : numeric === 0 ? 'c2a' : 'bad';
    }

    getDates(startOrStop: string) {
        const project = this.projectService.currentProject.getValue();
        if (!project) {
            return 'Ikke satt';
        }
        if (startOrStop === 'start') {
            if (!project.StartDate && !project.PlannedStartdate) {
                return 'Ikke satt';
            } else if (!project.StartDate && project.PlannedStartdate) {
                return moment(project.PlannedStartdate).format('DD. MMM YYYY');
            } else {
                return moment(project.StartDate).format('DD. MMM YYYY');
            }
        } else {
            if (!project.EndDate && !project.PlannedEnddate) {
                return 'Ikke satt';
            } else if (!project.EndDate && project.PlannedEnddate) {
                return moment(project.PlannedEnddate).format('DD. MMM YYYY');
            } else {
                return moment(project.EndDate).format('DD. MMM YYYY');
            }
        }
    }

    onActiveChartFilterChange(filter) {
        this.currentChartFilter = filter;
        this.onActiveChartTypeFilterChange(this.currentChartDataTypeFilter);
    }

    onActiveChartTypeFilterChange(filter) {
        this.currentChartDataTypeFilter = filter;
        if (filter.value === 'expence') {
            this.getExpensesChartQuery(this.currentChartFilter.value).subscribe((res) => {
                this.formatDataAndDrawExpencesChart(res.Data);
            });
        } else {
            this.getChartQuery(this.currentChartFilter.value).subscribe((res) => {
                this.formatDataAndDrawChart(res.Data);
            });
        }
    }

    private projectChanged(project: IMyProject) {
        if (project && project.ID) {
            this.project = project;
            this.getInitialDisplayData();
        }
    }

    private getInitialDisplayData() {
        if (!this.project || !this.project.ID) {
            return;
        }

        const queries: Observable<any>[] = [];

        if (this.projectService.hasJournalEntryLineModule) {
            this.onActiveChartTypeFilterChange(this.currentChartDataTypeFilter);
        }

        // Get sum of orderreserves
        queries.push( this.projectService.hasOrderModule ? this.statisticsService.GetAll(
            `model=customerorder&select=sum(items.SumTotalExVat) as sum,count(id) as counter` +
            `&filter=DefaultDimensions.ProjectID eq ${this.project.ID} and (items.statuscode eq 41102 and ` +
            `(statuscode eq 41002 or statuscode eq 41003))&expand=items,DefaultDimensions`) : Observable.of(null)
        );

        if (this.project.ProjectCustomerID) {
            queries.push(this.customerService.Get(this.project.ProjectCustomerID));
        } else {
            this.customerName = 'Kunde ikke valgt';
        }

        Observable.forkJoin(queries).subscribe((res) => {
            if (!res) {
                this.toast.addToast('Kunne ikke hente data', ToastType.bad, 5, 'Noe gikk galt når vi prøvde å hente prosjektdata');
                return;
            }
            if (res[0] ) {
                this.orderReserve = this.numberFormat.asMoney(res[0].Data[0].sum || 0);
            }

            if (res[1]) {
                this.customerName = res[1].Info.Name;
            } else {
                this.customerName = 'Kunde ikke valgt';
            }
        });
    }

    private getChartQuery(filter?: string) {
        return this.statisticsService.GetAll(
            `model=JournalEntryLine&filter=project.ID eq ${this.project.ID} and TopLevelAccountGroup.GroupNumber gt 2` +
            (filter ? ` and ${filter}` : '') +
            `&expand=Dimensions.Project,Account.TopLevelAccountGroup` +
            `&select=sum(JournalEntryLine.Amount) as SumAmount,` +
            `sum(casewhen(TopLevelAccountGroup.GroupNumber eq 3\\,JournalEntryLine.Amount\\,0)) as SumIncome,` +
            `sum(casewhen(TopLevelAccountGroup.GroupNumber gt 3\\,JournalEntryLine.Amount\\,0)) as SumCost,` +
            `sum(casewhen(TopLevelAccountGroup.GroupNumber ge 3\\,JournalEntryLine.Amount\\,0)) as SumResult,` +
            `year(FinancialDate) as year, month(FinancialDate) as month&orderby=year(financialdate),month(financialdate)`);
    }

    private getExpensesChartQuery(filter: string) {
        return this.statisticsService.GetAll(
            `model=JournalEntryLine&filter=project.ID eq ${this.project.ID} and TopLevelAccountGroup.GroupNumber gt 2` +
            (filter ? ` and ${filter}` : '') +
            `&expand=Dimensions.Project,Account.TopLevelAccountGroup` +
            `&select=sum(JournalEntryLine.Amount) as SumAmount,` +
            `TopLevelAccountGroup.Name as TopLevelAccountGroupName,TopLevelAccountGroup.GroupNumber as TopLevelAccountGroupGroupNumber`);
    }

    private formatDataAndDrawChart(budgetData: any[]) {
        const chartdata = this.fillGaps(budgetData);
        this.chart = this.getEmptyResultChart();
        this.currentChartData = chartdata;

        this.monthAndYearDataInBarChart = [];
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.chart.data.datasets[2].data = [];

        let result = 0;
        let labelMonths = chartdata.length < 5 ? this.MONTHS : this.MONTHS_SHORT;
        labelMonths = chartdata.length > 8 ? this.MONTHS_NUMERIC : labelMonths;
        const labelSeperator = chartdata.length > 8 ? '-' : ' ';

        chartdata.forEach((element) => {
            this.chart.data.labels.push(`${labelMonths[element.monthFinancialDate - 1]}${labelSeperator}${element.year}`);
            this.chart.data.datasets[0].data.push(element.SumIncome * -1);
            this.chart.data.datasets[1].data.push(element.SumCost * -1);
            this.chart.data.datasets[2].data.push(element.SumResult * -1);
            result += element.SumResult;
        });

        this.resultSoFar = this.numberFormat.asMoney(result * -1);

        this.drawChart();
    }

    private formatDataAndDrawExpencesChart(chartdata) {
        const labels = [];
        const data = [];
        let options = {};

        chartdata.forEach((element) => {
            if (element.SumAmount > 0) {
                labels.push(element.TopLevelAccountGroupName);
                data.push(element.SumAmount);
            }
        });

        if (!data.length) {
            options = {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Ingen utgifter å vise'
                },
                tooltips: {
                    callbacks: {
                        label: (tooltipItem, data) => {
                            const datasetIndex = tooltipItem.datasetIndex;
                            const index = tooltipItem.index;
                            const label = data.labels[index];
                            const value = data.datasets[datasetIndex].data[index];
                            const valueStr = this.numberFormat.asMoney(value as number, {
                                decimalLength: value.toString().indexOf('.') >= 0 ? 2 : 0
                            });
                            return label + ': ' + valueStr;
                        }
                    }
                }
            };
        }

        this.chart = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: this.CUSTOM_COLORS.slice(0, data.length)
                    }
                ]
            },
            options: options
        };

        this.drawChart();
    }

    private fillGaps(list: any[]) {
        if (list.length === 0 ) {
            let currentMonth = new Date().getMonth();
            currentMonth = new Date().getMonth() === 1 ? currentMonth++ : new Date().getMonth() === 12 ? currentMonth-- : currentMonth;
            list.push(this.getEmptyDummies(currentMonth - 1, new Date().getFullYear()));
            list.push(this.getEmptyDummies(currentMonth, new Date().getFullYear()));
            list.push(this.getEmptyDummies(currentMonth + 1, new Date().getFullYear()));
        } else if (list.length === 1) {
            const currentMonth = list[0].monthFinancialDate;
            if (currentMonth === 1) {
                list.unshift(this.getEmptyDummies(12, list[0].year - 1));
                list.push(this.getEmptyDummies(currentMonth + 1, list[0].year));
            } else if (currentMonth === 12) {
                list.unshift(this.getEmptyDummies(currentMonth - 1, list[0].year));
                list.push(this.getEmptyDummies(1, list[0].year + 1));
            } else {
                list.unshift(this.getEmptyDummies(currentMonth - 1, list[0].year));
                list.push(this.getEmptyDummies(currentMonth + 1, list[0].year));
            }
        } else if (list.length === 2) {
            const currentMonth = list[0].monthFinancialDate;
            if (currentMonth === 1) {
                list.unshift(this.getEmptyDummies(12, list[0].year - 1));
            } else {
                list.unshift(this.getEmptyDummies(currentMonth - 1, list[0].year));
            }
        } else {
            let index = 1;
            let monthShouldBe: number = list[0].monthFinancialDate === 12 ? 1 : list[0].monthFinancialDate + 1;
            let yearShouldBe: number = list[0].year;

            let notAllFilled: boolean = true;

            while (notAllFilled) {

                if (list[index].monthFinancialDate !== monthShouldBe || list[index].year !== yearShouldBe) {
                    list.splice(index, 0, this.getEmptyDummies(monthShouldBe, yearShouldBe));
                }
                index++;

                if (monthShouldBe === 12) {
                    monthShouldBe = 1;
                    yearShouldBe++;
                } else {
                    monthShouldBe++;
                }

                notAllFilled = !(yearShouldBe === list[list.length - 1].year && monthShouldBe === list[list.length - 1].monthFinancialDate);
            }
        }
        return list;
    }

    private getEmptyDummies(month: number, year: number) {
        return {
            SumAmount: 0,
            SumCost: 0,
            SumIncome: 0,
            SumResult: 0,
            monthFinancialDate: month,
            year: year
        };
    }

    private drawChart() {
        if (this.myChart) {
            this.myChart.destroy();
        }

        const element = this.chartElement1.nativeElement;
        this.myChart = new Chart(<any>element, this.chart);
    }

    private getEmptyResultChart() {
        return {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inntekter',
                    data: [],
                    backgroundColor: '#01a901',
                    borderWidth: 1
                },
                {
                    label: 'Utgifter',
                    data: [],
                    backgroundColor: '#d24d57',
                    borderWidth: 1
                },
                {
                    label: 'Resultat',
                    data: [],
                    borderColor: '#638bb3',
                    backgroundColor: '#638bb3',
                    borderWidth: 1,
                    type: 'line',
                    fill: false,
                    options: {
                        fill: false
                    }
                }
            ]
            },
            options: {
                legend: {
                    position: 'bottom'
                },
            }
        };
    }
}
