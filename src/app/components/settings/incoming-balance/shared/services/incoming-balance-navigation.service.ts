import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UniTranslationService } from '@app/services/services';
import { IUniTab } from '@uni-framework/uni-tabs';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export type IncomingBalanceTab = 'preparation'
    | 'date'
    | 'balance'
    | 'customers'
    | 'suppliers';

@Injectable()
export class IncomingBalanceNavigationService {

    private routes: IUniTab[] = [
        {
            path: 'preparation',
            name: this.translationService.translate('SETTINGS.INCOMING_BALANCE.NAVIGATION.PREPARATION'),
        },
        {
            path: 'date',
            name: this.translationService.translate('SETTINGS.INCOMING_BALANCE.NAVIGATION.DATE'),
        },
        {
            path: 'balance',
            name: this.translationService.translate('SETTINGS.INCOMING_BALANCE.NAVIGATION.BALANCE'),
        },
        {
            path: 'customers',
            name: this.translationService.translate('SETTINGS.INCOMING_BALANCE.NAVIGATION.CUSTOMERS'),
        },
        {
            path: 'suppliers',
            name: this.translationService.translate('SETTINGS.INCOMING_BALANCE.NAVIGATION.SUPPLIERS'),
        }
    ];

    private currentPathSubject$: BehaviorSubject<IncomingBalanceTab> = new BehaviorSubject(null);
    public currentPath$ = this.currentPathSubject$.asObservable().pipe(filter(path => !!path));

    constructor(
        private route: Router,
        private translationService: UniTranslationService,
    ) {
    }

    public getRouterTabs(): IUniTab[] {
        return this.routes;
    }

    public setCurrentPath(path: IncomingBalanceTab) {
        this.currentPathSubject$
            .next(path);
    }

    //#region internal module routing

    public ToNext(): Promise<boolean> {
        const currentPath = this.route.url.split('/').pop();
        const index = this.routes.findIndex(r => r.path === currentPath);
        if (index < (this.routes.length - 1)) {
            return this.toTab(<IncomingBalanceTab>this.routes[index + 1].path);
        }
        return new Promise(() => false);
    }

    public toPrevious(): Promise<boolean> {
        const currentPath = this.route.url.split('/').pop();
        const index = this.routes.findIndex(r => r.path === currentPath);
        if (index > 0) {
            return this.toTab(<IncomingBalanceTab>this.routes[index - 1].path);
        }
        return new Promise(() => false);
    }

    public toTab(tab: IncomingBalanceTab) {
        return this.route.navigate([...this.getBaseWizardRoute(), tab]);
    }

    public toWizard() {
        return this.route.navigate([...this.getBaseWizardRoute()]);
    }

    public toStart() {
        return this.route.navigate([...this.getBaseRoute()]);
    }

    //#endregion

    //#region away from module routing

    public toJournalEntry(journalEntryNumber: string) {
        const [number, year] = journalEntryNumber.split('-');
        return this.route.navigate(['accounting', 'transquery'], {queryParams: {JournalEntryNumber: number, AccountYear: year}});
    }

    public toOpeningBalance() {
        return this.route.navigate(['settings', 'opening-balance']);
    }

    public toImportPage() {
        return this.route.navigate(['import', 'page']);
    }

    //#endregion

    private getBaseWizardRoute(): string[] {
        return [...this.getBaseRoute(), 'wizard'];
    }

    private getBaseRoute(): string[] {
        return ['settings', 'accounting', 'incoming-balance'];
    }
}
