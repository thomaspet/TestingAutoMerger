import { Component, EventEmitter } from '@angular/core';
import { Input, Output } from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal';
import { Observable } from 'rxjs';
import { Kontantytelse } from '../../../shared/shared-services/incomeReportHelperService';
import { IncomeReportMonthlyPayService } from '../../../shared/shared-services/incomeReportMonthlyPayService';
import { IncomeReportsService } from '../../../shared/shared-services/incomeReportsService';


@Component({
    selector: 'income-report-monthlypay-modal',
    templateUrl: './income-report-monthlypay.modal.html',

})

export class IncomeReportMonthlyPayModal implements IUniModal {
    @Input() options: IModalOptions = {};

    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public busy: boolean = false;
    public isHidden: boolean = false;
    public monthlyPaySuggestion: number;
    public monthlyPaySuggestionText: string;
    public monthlyPayData: any;

    public deviationTooLarge: boolean = false;
    public paidLastThreeMonths: any[];
    public paidKontantytelserList: any[];

    public monthlyPaySelector = [
        { value: 0, label: 'Månedslønn arbeidsforhold' },
        { value: 1, label: 'Utbetalt siste måned' },
        { value: 2, label: 'Utbetalt siste 2 måneder' },
        { value: 3, label: 'Utbetalt siste 3 måneder' }
    ];

    public monthlyPayConfig = {
        template: item => item.label,
        searchable: false,
        hideDeleteButton: true
    };
    public selectedMonthlyPay = this.monthlyPaySelector[0];


    constructor(private monthlyPayService: IncomeReportMonthlyPayService,
        private incomeReportsService: IncomeReportsService) { }

    ngOnInit() {
        this.busy = true;
        Observable.forkJoin([
            this.monthlyPayService.getMonthlyPayforEmployment(this.options.data.employmentID),
            this.incomeReportsService.getKontantytelsefromPayroll(this.options.data.employmentID, this.options.data.fromDate, 3)
        ]).subscribe(data => {
            this.monthlyPayData = data[0];
            this.paidLastThreeMonths = data[1];

            this.setMonthlyPay();
            this.checkDeviation();
            this.busy = false;
        });
    }

    onMonthlyPaySelectorChange(item) {
        this.monthlyPaySuggestionText = '';
        if (item.value === 0) {
            this.paidKontantytelserList = [];
            this.setMonthlyPay(); 
        } else {
            if (this.paidLastThreeMonths?.length > 0) {
                this.paidKontantytelserList = [];
                let suggestion: number = 0;
                const periods = item.value;
                let periodsWithData = 0;
                for (let index = 0; index < periods; index++) {
                    const currMonth = this.paidLastThreeMonths[index];
                    if (currMonth) {
                        suggestion += currMonth?.BasicPay;
                        periodsWithData += 1;
                        this.monthlyPaySuggestionText += `${currMonth.PeriodText} : ${currMonth?.BasicPay}. `;
                        if (currMonth.SalaryTransactions?.length > 0) {
                            currMonth.SalaryTransactions.forEach(element => {
                                const trans = new Kontantytelse();
                                trans.sum = element.Sum;
                                trans.fromdate = element.FromDate;
                                trans.todate = element.ToDate;
                                trans.wagetypename = element.Wagetype.WageTypeName;
                                trans.wagetypenumber = element.WageTypeNumber;
                                this.paidKontantytelserList.push(trans);
                            });
                        }
                    }
                }
                this.monthlyPaySuggestion = suggestion / periodsWithData;
            }
        }
        this.checkDeviation();
    }

    private checkDeviation() {
        this.deviationTooLarge = this.calculatePercentDiff(this.monthlyPayData, this.monthlyPaySuggestion) > 10;
    }

    private setMonthlyPay() {
        this.monthlyPaySuggestion = this.monthlyPayData.MonthRate;
        if (this.monthlyPayData.WorkPercent > 0) {
            this.monthlyPaySuggestion = (this.monthlyPaySuggestion * this.monthlyPayData.WorkPercent) / 100;
        }

    }
    private calculatePercentDiff(monthlyPayData, monthlyPaySuggestion): number {
        if (monthlyPayData.HourRate > 0 && monthlyPayData.HoursPerWeek > 0
            && monthlyPayData.WorkPercent > 0 && monthlyPaySuggestion > 0) {

            const calculatedMonthPay =
                (monthlyPayData.HourRate * monthlyPayData.HoursPerWeek * 4 * monthlyPayData.WorkPercent) / 100;

            return 100 * Math.abs((calculatedMonthPay - monthlyPaySuggestion)
                / ((calculatedMonthPay + monthlyPaySuggestion) / 2));

        }
        return 0;
    }

    update() {
        this.onClose.emit(this.monthlyPaySuggestion);
    }
}


