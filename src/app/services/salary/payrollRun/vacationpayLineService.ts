import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine, WageDeductionDueToHolidayType} from '../../../unientities';
import {Observable, of} from 'rxjs';
import {FinancialYearService} from '@app/services/accounting/financialYearService';

@Injectable()
export class VacationpayLineService extends BizHttp<VacationPayLine> {
    constructor(
        protected http: UniHttp,
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

    public save(line: VacationPayLine): Observable<VacationPayLine> {
        return line.ID
            ? super.Put(line.ID, line)
            : super.Post(line);
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
