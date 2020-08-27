import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniTab} from '@uni-framework/uni-tabs';
import {BankService, PageStateService} from '@app/services/services';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-bank-reconciliation-list',
    templateUrl: './reconciliation-list.html',
    styleUrls: ['reconciliation-list.sass']
})

export class UniBankReconciliationList {

    tabs: IUniTab[] = [
        { name: 'Bankkontoer' },
        { name: 'Avstemmingsrapport' },
        { name: 'Kontoutskrifter' }
    ];

    actions: any[] = [
        { label: 'Avstem konto',            name: 'reconciliate' },
        { label: 'Se månedsoversikt',       name: 'month' }
    ];


    activeIndex: number = 0;
    bankAccounts: any[] = [];
    currentAccount: any;
    dataLoaded: boolean = false;
    busy: boolean = true;

    constructor (
        private bankService: BankService,
        private router: Router,
        private route: ActivatedRoute,
        private pageStateService: PageStateService,
        private tabService: TabService
    ) {

        this.route.queryParams.subscribe((params: any) => {
            this.activeIndex = +params['tabIndex'] || 0;
            this.setTabAndState();
            this.getListAndLoadData();
        });
    }

    getListAndLoadData() {
        this.busy = true;
        this.bankService.getBankAccountsForReconciliation()
            .finally( () => this.busy = false )
            .subscribe(accounts => {
            this.bankAccounts = accounts.map(acc => {
                acc.count = acc.total - acc.closed;
                return acc;
            }).filter(bankAccount => {
                return bankAccount.LockedAccount === false;
            }).sort((a, b) => {
                return a.count === b.count ? 0 : a.count ? -1 : 1;
            });
            this.dataLoaded = true;
        }, err => {
            this.dataLoaded = true;
            this.busy = false;
        });
    }

    onTabClick(tab: IUniTab) {
        this.pageStateService.setPageState('tabIndex', this.activeIndex.toString());
    }

    goToSettings() {
        this.router.navigateByUrl('/settings/company');
    }

    onActionClick(action: any, account: any) {
        switch (action.name) {
            case 'reconciliate':
                this.router.navigateByUrl(`/bank/reconciliationmatch?accountid=${account.AccountID}`);
                break;

            case 'month':
                this.currentAccount = account;
                this.activeIndex = 1;
                this.setTabAndState();
                break;
        }
    }

    private setTabAndState() {
        this.pageStateService.setPageState('tabIndex', this.activeIndex.toString());
        this.tabService.addTab({
            name: 'Bankavstemming',
            url: this.pageStateService.getUrl(),
            moduleID: UniModules.BankReconciliation,
            active: true
        });
    }

}
