import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { IIncomingBalanceLine, IncomingBalanceStoreService } from '../../../services/incoming-balance-store.service';
import { IncomingBalanceDiffService } from './incoming-balance-diff.service';

@Injectable()
export class IncomingBalanceSupplierStoreService {
    public journalEntry$ = this.stateService.journalEntry$;
    public journalLines$ = this.stateService.getLinesFromSource('Supplier');
    public supplierDiff$ = this.diffService.getDiff('Supplier');
    public isBooked$ = this.stateService.isBooked$;
    public sumToDiffAgainst$ = this.diffService.getSumToDiffAgainst('Supplier');

    public supplierSum$ = this.journalLines$
        .pipe(
            map(lines => lines.reduce((acc, curr) => acc + (curr.Amount || 0), 0))
        );

    constructor(
        private diffService: IncomingBalanceDiffService,
        private stateService: IncomingBalanceStoreService,
    ) { }

    public createOrUpdate(line: IIncomingBalanceLine) {
        return this.stateService
            .getAccount('Supplier', line.SubAccount)
            .pipe(
                take(1),
                switchMap(accountInfo => {
                    line._source = 'Supplier';
                    line.Account = accountInfo?.account;
                    return this.stateService.createOrUpdate(line);
                })
            );
    }

    public remove(line: IIncomingBalanceLine) {
        return this.stateService.remove(line);
    }
}
