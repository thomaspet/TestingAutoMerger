import { Injectable } from '@angular/core';
import { IIncomingBalanceLine, IncomingBalanceStoreService } from '../../../services/incoming-balance-store.service';
import { IncomingBalanceDiffService } from './incoming-balance-diff.service';

@Injectable()
export class IncomingBalanceListStoreService {

    public journalLines$ = this.stateService.getLinesFromSource('Balance');
    public balanceDiff$ = this.diffService.getDiff('Balance');
    public journalEntry$ = this.stateService.journalEntry$;
    public isBooked$ = this.stateService.isBooked$;

    constructor(
        private stateService: IncomingBalanceStoreService,
        private diffService: IncomingBalanceDiffService,
    ) { }

    public createOrUpdate(line: IIncomingBalanceLine) {
        line._source = 'Balance';
        return this.stateService.createOrUpdate(line);
    }

    public remove(line: IIncomingBalanceLine) {
        return this.stateService.remove(line);
    }
}
