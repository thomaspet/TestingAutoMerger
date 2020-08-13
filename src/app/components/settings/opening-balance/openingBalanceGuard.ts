import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {StatisticsService} from '@app/services/common/statisticsService';
import {map, switchMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {UniModalService} from '@uni-framework/uni-modal';
import {OpeningBalanceGuardModal} from '@app/components/settings/opening-balance/openingBalanceGuardModal';

@Injectable()
export class OpeningBalanceGuard implements CanActivate {
    constructor(private statisticsService: StatisticsService, private modalService: UniModalService) {
    }

    public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.statisticsService.GetAllUnwrapped(
            '?top=1&model=JournalEntryLine' +
            '&expand=Account,SubAccount,Period' +
            '&filter=(Period.AccountYear eq 2020) and ' +
            '(Account.AccountNumber eq 2000 or SubAccount.AccountNumber eq 2000) ' +
            'and isnull(StatusCode,0) ne 31004' +
            '&select=ID as ID' +
            '&join=JournalEntryLine.JournalEntryID eq FileEntityLink.EntityID and Journalentryline.createdby eq user.globalidentity'
        ).pipe(
            map(data => data.length > 0),
            switchMap( hasOpeningBalance => {
                if (!hasOpeningBalance) {
                    return of(true);
                }
                return this.modalService.open(OpeningBalanceGuardModal).onClose;
            }),
            map(modalResult => !!modalResult) // ensure we return true or false
        )
    }
}
