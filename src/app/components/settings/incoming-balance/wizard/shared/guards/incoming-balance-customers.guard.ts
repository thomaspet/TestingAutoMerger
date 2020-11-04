import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { IncomingBalanceListStoreService } from '../services/incoming-balance-list-store.service';
import { IncomingBalanceDiffService } from '../services/incoming-balance-diff.service';

@Injectable()
export class IncomingBalanceCustomersGuard implements CanActivate {
    constructor(
        private diffService: IncomingBalanceDiffService,
        private stateService: IncomingBalanceListStoreService,
    ) {}
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return combineLatest([
                this.diffService.getDiff('Balance'),
                this.stateService.journalLines$,
            ])
            .pipe(
                take(1),
                map(([diff, lines]) => !diff && !!lines.length),
            );
    }
}
