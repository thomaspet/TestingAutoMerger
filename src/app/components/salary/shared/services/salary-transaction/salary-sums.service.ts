import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaxAndAgaSums, AGACalculation, SalaryTransactionSums, SalaryTransactionPeriodSums, AGADraw, AGATax, AGAPension } from '@uni-entities';
import { BizHttp, UniHttp } from '@uni-framework/core/http';

export interface ITaxAndAgaSums extends TaxAndAgaSums {
    Aga: AGACalculation;
}

export interface ISystemTaxAndAgaSums {
    orgNumber?: string;
    zone?: string;
    municipality?: string;
    type?: string;
    rate?: number;
    base?: number;
    aga?: number;
}

@Injectable()
export class SalarySumsService extends BizHttp<SalaryTransactionSums> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = 'salarysums';
    }

    public getFromPayrollRun(id: number, filter: string = null): Observable<SalaryTransactionSums> {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=get-sums&id=${id}${filter ? '&filter=' + filter : ''}`)
            .send()
            .map(response => response.body);
    }

    public getSumsInYear(year: number, employeeID: number = null): Observable<SalaryTransactionSums> {
        let filter = `year(PayDate) eq ${year} and transactions.EmployeeID eq ${employeeID} and StatusCode gt ${0}`;

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `?action=getall&fromPayrollRun=true&filter=${filter}`)
            .send()
            .map(response => response.body);
    }

    public getSumsInPeriod(fromPeriod: number, toPeriod: number, transYear: number): Observable<SalaryTransactionPeriodSums[]> {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + `?action=sums-in-period&fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&year=${transYear}`)
            .send()
            .map(response => response.body);
    }

    public getSumsFromPeriod(fromPeriod: number, toPeriod: number, transYear: number): Observable<ITaxAndAgaSums> {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(`${this.relativeURL}?action=sum-aga-lines&fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&year=${transYear}`)
            .send()
            .map(response => response.body);
    }

    public getAgaSum(aga: AGACalculation): number {
        const agaRet = [
            ...aga.agaDraw.map(a => this.calculateAga(a.agaBase, a.agaRate)),
            ...aga.agaPension.map(a => this.calculateAga(a.agaBase, a.agaRate)),
            ...aga.agaTax.map(a => this.calculateAga(a.agaBase, a.agaRate)),
        ];

        return agaRet.reduce((acc, curr) => acc + curr, 0);
    }

    public getAgaBase(aga: AGACalculation): number {
        const agaRet = [
            ...aga.agaDraw.map(a => a.agaBase),
            ...aga.agaPension.map(a => a.agaBase),
            ...aga.agaTax.map(a => a.agaBase),
        ];

        return agaRet.reduce((acc, curr) => acc + curr, 0);
    }

    public getAgaList(aga: AGACalculation): ISystemTaxAndAgaSums[] {
        return [
            ...aga.agaDraw.map(draw => this.agaDrawToSystemTaxAndAgaSums(draw)),
            ...aga.agaPension.map(pension => this.agaPensionToSystemTaxAndAgaSums(pension)),
            ...aga.agaTax.map(tax => this.agaTaxToSystemTaxAndAgaSums(tax)),
        ];
    }

    private agaDrawToSystemTaxAndAgaSums(aga: AGADraw): ISystemTaxAndAgaSums {
        return {
            orgNumber: aga.subEntity.OrgNumber,
            zone: aga.zoneName,
            municipality: aga.municipalityName,
            type: 'Refusjon',
            base: aga.agaBase,
            rate: aga.agaRate,
            aga: this.calculateAga(aga.agaBase, aga.agaRate),
        };
    }

    private agaTaxToSystemTaxAndAgaSums(aga: AGATax): ISystemTaxAndAgaSums {
        return {
            orgNumber: aga.subEntity.OrgNumber,
            zone: aga.zoneName,
            municipality: aga.municipalityName,
            type: 'Grunnlag',
            base: aga.agaBase,
            rate: aga.agaRate,
            aga: this.calculateAga(aga.agaBase, aga.agaRate),
        };
    }

    private agaPensionToSystemTaxAndAgaSums(aga: AGAPension): ISystemTaxAndAgaSums {
        return {
            orgNumber: aga.subEntity.OrgNumber,
            zone: aga.zoneName,
            municipality: aga.municipalityName,
            type: 'Pensjon',
            base: aga.agaBase,
            rate: aga.agaRate,
            aga: this.calculateAga(aga.agaBase, aga.agaRate),
        };
    }

    private calculateAga(base: number, rate: number): number {
        return base * rate / 100;
    }

}
