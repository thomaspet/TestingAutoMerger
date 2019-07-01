import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {VacationPayLine, WageDeductionDueToHolidayType, VacationInfo} from '../../../unientities';
import {Observable} from 'rxjs';
import {SalaryTransactionService} from '../salaryTransaction/salaryTransactionService';
import {FinancialYearService} from '@app/services/accounting/financialYearService';
export interface IVacationPayLine extends VacationPayLine {
    VacationInfos: IVacationInfo[];
}
export interface IVacationInfo extends VacationInfo {
    IsPayed: boolean;
    Base: number;
    MissingVacationPay: number;
    Age: number;
}
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

    public getVacationpayBasis(year: number = this.yearService.getActiveYear(), payrun: number = 0): Observable<IVacationPayLine[]> {
        return super.GetAction(null, 'lines', `payrunID=${payrun}&year=${year}`);
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

    public manualVacationPayBase(line: IVacationPayLine) {
        return this.yearService.getActiveYear() - line.Year > 1
            ? this.sumUpPrevInfo(line, 'ManualBase') + line.ManualVacationPayBase
            : line.ManualVacationPayBase;
    }

    public sumUpPrevInfo(line: IVacationPayLine, field: string) {
        return this.sumUpInfos(line.VacationInfos.filter(x => x.BaseYear < line.Year), field);
    }

    public sumUpInfos(infos: VacationInfo[], field: string) {
        return infos
            .reduce((acc, curr) => acc + curr[field] || 0, 0);
    }
}
