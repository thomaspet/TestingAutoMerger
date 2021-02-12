import { Injectable } from '@angular/core';
import { StatisticsService } from '@app/services/services';
import { CodeListRowsCodeListRow, LocalDate } from '@uni-entities';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { IncomeReportsService } from './incomeReportsService';

@Injectable()
export class IncomeReportHelperService {
    private _naturalytelser: CodeListRowsCodeListRow[];
    private _ytelseskoder: CodeListRowsCodeListRow[];
    private _endringsaarsaker: CodeListRowsCodeListRow[];
    private _redusertUtbetalingsTyper: CodeListRowsCodeListRow[];
    private _aarsakTilInnsendingCodes: CodeListRowsCodeListRow[];

    constructor(
        private incomereportsService: IncomeReportsService,
        private statisticsService: StatisticsService,
    ) { }


    getNaturalytelser(): Observable<CodeListRowsCodeListRow[]> {
        if (this._naturalytelser) {
            return of(this._naturalytelser);
        }
        return this.incomereportsService.GetAction(null, 'code-list', 'type=F')
            .pipe(
                tap(data => this._naturalytelser = data)
            );
    }
    getAarsakTilInnsendingCodes(): Observable<CodeListRowsCodeListRow[]> {
        if (this._aarsakTilInnsendingCodes) {
            return of(this._aarsakTilInnsendingCodes);
        }
        return this.incomereportsService.GetAction(null, 'code-list', 'type=A')
            .pipe(
                tap(data => this._aarsakTilInnsendingCodes = data)
            );
    }
    getYtelseskoder(): Observable<CodeListRowsCodeListRow[]> {
        if (this._ytelseskoder) {
            return of(this._ytelseskoder);
        }
        return this.incomereportsService.GetAction(null, 'code-list', 'type=B')
            .pipe(
                tap(data => this._ytelseskoder = data)
            );
    }
    getEndringsaarsaker(): Observable<CodeListRowsCodeListRow[]> {
        if (this._endringsaarsaker) {
            return of(this._endringsaarsaker);
        }
        return this.incomereportsService.GetAction(null, 'code-list', 'type=D')
            .pipe(
                tap(data => this._endringsaarsaker = data)
            );
    }
    getRedusertUtbetalingsTyper(): Observable<CodeListRowsCodeListRow[]> {
        if (this._redusertUtbetalingsTyper) {
            return of(this._redusertUtbetalingsTyper);
        }
        return this.incomereportsService.GetAction(null, 'code-list', 'type=E')
            .pipe(
                tap(data => this._redusertUtbetalingsTyper = data)
            );
    }
    getNaturalytelseAmount(description: string, employmentID: number): Observable<number> {
        return this.statisticsService
            .GetAllUnwrapped(
                `select=ID as ID,PayDate`
                + `&model=PayrollRun`
                + `&orderby=PayDate desc`
                + `&expand=transactions`
                + `&filter=isnull(StatusCode,0) gt 0`
                + `&top=1`
            )
            .pipe(
                map(result => result[0]?.ID),
                switchMap(runID => !runID
                    ? of([])
                    : this.statisticsService.GetAllUnwrapped(
                        `select=sum(Sum) as Sum`
                        + `&model=SalaryTransaction`
                        + `&expand=WageType`
                        + `&filter=PayrollRunID eq ${runID} and EmploymentID eq ${employmentID} and WageType.Description eq '${description}'`))
            )
            .pipe(
                map(result => result[0]?.Sum ?? 0),
            );
    }

    public getIncomReportTypeText(code: string, codes: CodeListRowsCodeListRow[]): string {
        if (codes) {
            const cachedText = codes.find(y => y.Code === code).Value2;
            if (cachedText) {
                return cachedText;
            }
        }
        return '';
    }
}

export interface IPeriode {
    fom: LocalDate;
    tom: LocalDate;
}

export class Ytelse {
    public naturalytelseType: String;
    public fom: LocalDate;
    public beloepPrMnd: number | null;
}
export class EndringIRefusjon {
    public endringsdato: LocalDate;
    public refusjonsbeloepPrMnd: number;
}
export class FravaerPeriode implements IPeriode {
    public fom: LocalDate;
    public tom: LocalDate;
}

export class Kontantytelse {
    public wagetypenumber: string;
    public wagetypename: string;
    public fromdate: Date;
    public todate: Date;
    public sum: number;
}


