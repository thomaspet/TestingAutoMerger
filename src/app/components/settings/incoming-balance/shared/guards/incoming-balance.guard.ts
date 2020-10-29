import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { IncomingBalanceRoutingModalComponent } from '@app/components/settings/incoming-balance/shared/components/incoming-balance-routing-modal/incoming-balance-routing-modal.component';
import { UniModalService } from '@uni-framework/uni-modal';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IncomingBalanceHttpService, IncomingBalanceRoute } from '../../services/incoming-balance-http.service';

@Injectable()
export class IncomingBalanceGuard implements CanActivate {
    constructor(
        private router: Router,
        private modalService: UniModalService,
        private httpService: IncomingBalanceHttpService,
    ) {}
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
            return this.httpService.getTypeFromBackend()
                .pipe(
                    switchMap(type => type ? of(type) : this.askUserForType()),
                    map(type => this.getGuardResult(type))
                );
    }

    private askUserForType(): Observable<IncomingBalanceRoute> {
        return this.modalService
            .open(IncomingBalanceRoutingModalComponent)
            .onClose;
    }

    private getGuardResult(type: IncomingBalanceRoute): boolean | UrlTree {
        if (!type) {
            return false;
        }
        const routes: {type: IncomingBalanceRoute, route: string}[] = [
            { type: 'existing', route: '/settings/accounting/incoming-balance' },
            { type: 'existing-balance', route: '/settings/accounting/incoming-balance/wizard/balance'},
            { type: 'new', route: '/settings/opening-balance'},
        ];
        return this.router.parseUrl(routes.find(r => r.type === type)?.route);
    }

}
