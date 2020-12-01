import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {IUniTab} from '@uni-framework/uni-tabs';
import {BankService, PageStateService} from '@app/services/services';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import { UniModalService } from '@uni-framework/uni-modal';
import { ManualBankStatementRegisterModal } from '@app/components/bank-reconciliation/manual-bankstatement-register-modal/manual-bankstatement-register-modal';
import { BankStatementUploadModal } from '@app/components/bank-reconciliation/bank-statement-upload-modal/bank-statement-upload-modal';

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
        { label: 'Avstem konto',                name: 'reconciliate' },
        { label: 'Se månedsoversikt',           name: 'month' },
        { label: 'Opprett bankposter manuelt',  name: 'manual_post' },
        { label: 'Legg til kontoutskrift',      name: 'upload' }
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
        private tabService: TabService,
        private modalService: UniModalService,
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
                acc.Account = {
                    AccountNumber: acc.AccountAccountNumber,
                    AccountName: acc.AccountName,
                };
                return acc;
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

    goToBankSettings() {
        this.router.navigateByUrl('/settings/bank');
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
            case 'manual_post':
                this.modalService.open(ManualBankStatementRegisterModal, {
                    data: {
                        AccountID: account.AccountID
                    },
                    closeOnClickOutside: false
                }).onClose.subscribe((response) => {
                    if (response) {
                        this.getListAndLoadData();
                    }
                });
                break;
            case 'upload':
                this.openImportModal(account);
                break;
        }
    }

    openImportModal(account: any) {
        this.modalService.open(BankStatementUploadModal, {
            data: {
                bankAccounts: this.bankAccounts,
                selectedAccountID: account.AccountID
            }
        }).onClose.subscribe(importResult => {
            if (importResult) {
                this.getListAndLoadData();
            }
        });
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
