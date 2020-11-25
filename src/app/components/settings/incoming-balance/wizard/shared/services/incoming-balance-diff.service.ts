import { Injectable } from '@angular/core';
import { UniMath } from '@uni-framework/core/uniMath';
import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';
import { IncomingBalanceLineSource, balanceLineSources, IIncomingBalanceLine, IncomingBalanceStoreService } from '../../../services/incoming-balance-store.service';

@Injectable()
export class IncomingBalanceDiffService {

    constructor(private stateService: IncomingBalanceStoreService) { }

    public getDiff(source: IncomingBalanceLineSource) {
        if (source === 'Balance') {
            return this.stateService
                .getLinesFromSource(source)
                .pipe(
                    map(lines => this.sumUp(lines)),
                );
        }
        return this.stateService
            .getLinesFromSource(source)
            .pipe(
                switchMap(lines => combineLatest([
                    this.stateService.getAccountNumbers(source),
                    this.stateService.getLinesFromSource('Balance'),
                    of(lines),
                ])),
                map(([accountNumbers, balanceLines, lines]) => this.sumUpBalance(accountNumbers, balanceLines) - this.sumUp(lines)),
        );
    }

    public getSumToDiffAgainst(source: IncomingBalanceLineSource) {
        if (source === 'Balance') {
            return of(0);
        }
        return combineLatest([
            this.stateService.getAccountNumbers(source),
            this.stateService.getLinesFromSource('Balance')
        ])
        .pipe(
            take(1),
            map(([accountNumbers, balanceLines]) => this.sumUpBalance(accountNumbers, balanceLines)),
        );
    }

    public getAllDiffs(): Observable<number[]> {
        return combineLatest(
            balanceLineSources.map(source => this.getDiff(source)),
        )
        .pipe(
            debounceTime(200),
        );
    }

    private sumUpBalance(accountNumbers: number[], balanceLines: IIncomingBalanceLine[]) {
        const linesWithMainAccounts = balanceLines
            .filter(line => accountNumbers.some(accountNumber => line.Account?.AccountNumber === accountNumber));
        return this.sumUp(linesWithMainAccounts);
    }

    private sumUp(lines: IIncomingBalanceLine[]) {
        return UniMath.round(lines.reduce((acc, curr) => acc + (curr.Amount || 0), 0));
    }

}
