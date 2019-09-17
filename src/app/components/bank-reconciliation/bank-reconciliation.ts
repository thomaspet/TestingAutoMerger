import {Component, ErrorHandler} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {StatisticsService, BankAccountService, PageStateService} from '@app/services/services';
import {BankAccount, BankStatementMatch} from '@uni-entities';
import * as moment from 'moment';
import { BankStatementSession } from '@app/services/bank/bankstatementsession';
import {UniModalService} from '@uni-framework/uni-modal';
import {BankStatementUploadModal} from './bank-statement-upload-modal/bank-statement-upload-modal';
import {BankStatementJournalModal} from './bank-statement-journal/bank-statement-journal-modal';

@Component({
    selector: 'bank-reconciliation',
    templateUrl: './bank-reconciliation.html',
    styleUrls: ['./bank-reconciliation.sass'],
})
export class BankReconciliation {
    saveBusy: boolean;

    bankAccounts: BankAccount[];
    selectedBankAccount: BankAccount;
    confirmedMatches: BankStatementMatch[] = [];
    bankPeriod: Date;
    journalEntryPeriod: Date;
    autoSuggest = false;
    cleanUp = false;
    loaded = false;
    closedGroupDetailsVisible = false;

    constructor(
        tabService: TabService,
        private statisticsService: StatisticsService,
        private bankAccountService: BankAccountService,
        private errorHandler: ErrorHandler,
        private modalService: UniModalService,
        public session: BankStatementSession,
        private pageStateService: PageStateService
    ) {
        tabService.addTab({
            url: '/bank-reconciliation',
            name: 'Bankavstemming',
            active: true,
            moduleID: UniModules.BankReconciliation
        });

        this.initData();
    }

    save() {
        if (this.saveBusy) {
            return;
        }

        this.saveBusy = true;
        this.session.saveChanges().subscribe(
            () => {
                this.session.reload().subscribe(() => this.checkSuggest());
                this.saveBusy = false;
            },
            err => {
                this.errorHandler.handleError(err);
                this.saveBusy = false;
            }
        );
    }

    initData() {
        this.session.clear();
        this.bankAccountService.GetAll('expand=Account,Bank&filter=CompanySettingsID gt 0 and AccountID gt 0').subscribe(
            accounts => {
                this.bankAccounts = accounts || [];
                if (this.bankAccounts.length) {

                    this.selectedBankAccount = this.bankAccounts[0];

                    // Set current account from routeparam ? (?accountd=123)
                    const state = this.pageStateService.getPageState();
                    if (state.accountid) {
                        const acc = this.bankAccounts.find( x => x.AccountID === parseInt(state.accountid, 10));
                        if (acc) {
                            this.selectedBankAccount = acc;
                        }
                    }

                    this.onAccountChange();
                }
            },
            err => {
                console.error(err);
                this.bankAccounts = [];
            }
        );
    }

    openJournalModal() {
        const candidates = this.session.stage.length > 0
            ? this.session.stage.filter( x => x.IsBankEntry)
            : this.session.bankEntries.filter( x => ((!x.StageGroupKey) && (!x.Closed)) );
        this.modalService.open(BankStatementJournalModal, {
            data: {
                bankAccounts: this.bankAccounts,
                selectedAccountID: this.selectedBankAccount.AccountID,
                entries: candidates
            }
        }).onClose.subscribe(importResult => {
            if (!importResult) { return; }
            this.session.reload().subscribe( () => {
                this.autoSuggest = true;
                this.checkSuggest();
            });
        });
    }

    openImportModal() {
        this.modalService.open(BankStatementUploadModal, {
            data: {
                bankAccounts: this.bankAccounts,
                selectedAccountID: this.selectedBankAccount.AccountID
            }
        }).onClose.subscribe(importResult => {
            if (importResult && importResult.FromDate && importResult.AccountID) {
                this.bankPeriod = new Date(importResult.FromDate);
                this.journalEntryPeriod = new Date(importResult.FromDate);

                const account = this.bankAccounts.find(a => a.AccountID === importResult.AccountID);
                if (account) {
                    this.selectedBankAccount = account;
                    this.onBankPeriodChange();
                }
            }
        });
    }

    onAccountChange() {
        this.session.ledgerAccountID = this.selectedBankAccount.AccountID;
        const firstUnreconciledOdata = `model=BankStatementEntry`
            + `&select=min(bookingdate) as FirstUnreconciled`
            + `&filter=BankStatement.AccountID eq ${this.selectedBankAccount.AccountID} and isnull(StatusCode,48001) lt 48002`
            + `&expand=BankStatement`;

        this.statisticsService.GetAllUnwrapped(firstUnreconciledOdata).pipe(
            catchError(() => of(new Date()))
        ).subscribe(
            res => {
                const firstUnreconciled = res && res[0] && res[0].FirstUnreconciled;
                const date = firstUnreconciled ? new Date(firstUnreconciled) : new Date();
                date.setDate(1); // always use first day of period
                this.bankPeriod = date;
                this.journalEntryPeriod = date;
                this.onBankPeriodChange();
            }
        );
    }

    onBankPeriodChange(offset = 0) {
        if (this.selectedBankAccount) {
            this.cleanUp = this.session.totalTransactions > 100;
            if (offset) { this.bankPeriod = moment(this.bankPeriod).add(offset, 'months').toDate(); }
            const fromDate = moment(this.bankPeriod).startOf('month').toDate();
            const toDate = moment(this.bankPeriod).endOf('month').toDate();
            this.pageStateService.setPageState('accountid', this.selectedBankAccount.AccountID.toString());
            this.session.load(fromDate, toDate, this.selectedBankAccount.AccountID)
                .finally( () => { this.cleanUp = false; this.loaded = true; } )
                .subscribe(() => this.checkSuggest());
        }
    }

    closeStage() {
        this.session.closeStage();
        this.checkSuggest();
    }

    reset() {
        this.session.reset();
        this.autoSuggest = false;
    }

    checkSuggest(setFromUI = false) {
        if (this.autoSuggest) {
            this.session.tryNextSuggestion();
        } else if (setFromUI) {
            this.session.clearStage();
        }
    }

    startAutoMatch() {
        this.session.requestSuggestions().subscribe(x => {
            while (true) {
                this.session.clearStage();
                if (this.session.tryNextSuggestion(x)) {
                    this.session.closeStage();
                } else {
                    break;
                }
            }
        });
    }
}
