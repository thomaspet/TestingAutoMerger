import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine, WageDeductionDueToHolidayType} from '../../../unientities';
import {Observable, of} from 'rxjs';
import {SalaryTransactionService} from '../salaryTransaction/salaryTransactionService';
import {FinancialYearService} from '@app/services/accounting/financialYearService';

@Injectable()
export class VacationpayLineService extends BizHttp<VacationPayLine> {
    constructor(
        protected http: UniHttp,
        private salaryTransactionService: SalaryTransactionService,
        private yearService: FinancialYearService,
    ) {
        super(http);
        this.relativeURL = VacationPayLine.RelativeUrl;
        this.entityType = VacationPayLine.EntityType;
    }

    public WageDeductionDueToHolidayArray: any = [
        { id: WageDeductionDueToHolidayType.Deduct4PartsOf26, name: '-4/26 av månedslønn' },
        { id: WageDeductionDueToHolidayType.Deduct3PartsOf22, name: '-3/22 av månedslønn' },
        { id: WageDeductionDueToHolidayType.Add1PartOf26, name: '+1/26 av månedslønn' },
        { id: WageDeductionDueToHolidayType.Deduct1PartOf26, name: '-1/26 av månedslønn' }
    ];

    public getVacationpayBasis(year: number = 0, payrun: number = 0, showAllEmps?: boolean)
        : Observable<VacationPayLine[]> {
        return super.GetAction(null, 'lines', `payrunID=${payrun}&year=${year || this.yearService.getActiveYear()}&showAll=${showAllEmps}`);
    }

    public createVacationPay(year: number, payrun: number, payList: VacationPayLine[], hasSixthWeek: boolean) {
        super.invalidateCache();
        this.salaryTransactionService.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=pay-fromlines&payrollID=${payrun}&year=${year}&hasSixthWeek=${hasSixthWeek}`)
            .withBody(payList)
            .send();
    }

    public toSalary(baseYear: number, run: number, payList: VacationPayLine[]): Observable<boolean> {
        if (!payList.length) {
            return of(true);
        }
        super.invalidateCache();
        return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint(`${this.relativeURL}?action=to-salary&payrollID=${run}&baseYear=${baseYear}`)
            .withBody(payList)
            .send();
    }
}
