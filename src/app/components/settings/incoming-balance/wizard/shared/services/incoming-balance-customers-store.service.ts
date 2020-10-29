import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { IIncomingBalanceLine, IncomingBalanceStoreService } from '../../../services/incoming-balance-store.service';
import { IncomingBalanceDiffService } from './incoming-balance-diff.service';

@Injectable()
export class IncomingBalanceCustomersStoreService {

    public journalEntry$ = this.stateService.journalEntry$;
    public journalLines$ = this.stateService.getLinesFromSource('Customer');
    public customerDiff$ = this.diffService.getDiff('Customer');
    public isBooked$ = this.stateService.isBooked$;
    public sumToDiffAgainst$ = this.diffService.getSumToDiffAgainst('Customer');

    public customerSum$ = this.journalLines$
        .pipe(
            map(lines => lines.reduce((acc, curr) => acc + (curr.Amount || 0), 0))
        );

    constructor(
        private stateService: IncomingBalanceStoreService,
        private diffService: IncomingBalanceDiffService,
    ) { }

    public createOrUpdate(line: IIncomingBalanceLine) {
        return this.stateService
            .getAccount('Customer', line.SubAccount)
            .pipe(
                take(1),
                switchMap(mainAccount => {
                    line._source = 'Customer';
                    line.Account = mainAccount?.account;
                    return this.stateService.createOrUpdate(line);
                })
            );
    }

    public remove(line: IIncomingBalanceLine) {
        return this.stateService.remove(line);
    }
}
