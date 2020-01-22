import {Component, ErrorHandler} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {catchError} from 'rxjs/operators';
import {StatisticsService, BankAccountService, PageStateService} from '@app/services/services';
import {BankAccount, BankStatementMatch} from '@uni-entities';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IContextMenuItem} from '@uni-framework/ui/unitable/index';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {BankStatementSession, IMatchEntry} from '@app/services/bank/bankstatementsession';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {BankStatementUploadModal} from './bank-statement-upload-modal/bank-statement-upload-modal';
import {BankStatementJournalModal} from './bank-statement-journal/bank-statement-journal-modal';
import { BankStatementSettings } from './bank-statement-settings/bank-statement-settings';
import * as moment from 'moment';
import {Observable, of} from 'rxjs';

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
    autoSuggest = true;
    cleanUp = false;
    loaded = false;
    closedGroupDetailsVisible = false;
    settings = { MaxDayOffset: 5, MaxDelta: 0.0 };
    saveactions: IUniSaveAction[] = [];
    contextMenuItems: IContextMenuItem[] = [];
    toolbarconfig: IToolbarConfig = {
        title: 'Bankavstemming',
        contextmenu: [
            {
                label: 'Last opp ny kontoutskrift',
                action: () => { this.openImportModal(); }
            },
            {
                label: 'Før restsum av markerte linjer',
                action: () => { this.openJournalModal(); }
            },
            {
                label: 'Se alle åpne poster i bilagsføring',
                action: () => { this.openJournalModal(true); }
            }
        ]
    };

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
            url: '/bank/reconciliationmatch',
            name: 'Bankavstemming',
            active: true,
            moduleID: UniModules.BankReconciliation
        });

        this.initData();
    }

    updateSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre',
                action: done => this.save(done),
                main: true,
                disabled: !(this.session && this.session.closedGroups && this.session.closedGroups.length > 0)
            }
        ];
    }

    save(done?) {
        if (this.saveBusy) {
            return;
        }

        this.closedGroupDetailsVisible = false;
        this.saveBusy = true;
        this.session.saveChanges().subscribe(
            () => {
                this.session.reload().subscribe(() => this.checkSuggest());
                this.saveBusy = false;
                if (done) {
                    done();
                }
            },
            err => {
                this.errorHandler.handleError(err);
                this.saveBusy = false;
                if (done) {
                    done();
                }
            }
        );
    }

    initData() {
        this.session.clear();
        this.updateSaveActions();
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

    openJournalModal(all: boolean = false) {
        if (!this.loaded) { return; }

        const openModal = () => {
            this.modalService.open(BankStatementJournalModal, {
                data: {
                    bankAccounts: this.bankAccounts,
                    selectedAccountID: this.selectedBankAccount.AccountID,
                    entries: this.getJournalCandidates(all)
                }
            }).onClose.subscribe(importResult => {
                if (!importResult) { return; }
                this.session.reload().subscribe( () => {
                    this.autoSuggest = true;
                    this.checkSuggest();
                });
            });
        }

        if (this.session.closedGroups.length) {
            const msg = `Du har ${this.session.closedGroups.length} kobling${this.session.closedGroups.length > 1 ? 'er ' : ' '}` +
            `som ikke er lagret. Ønsker du å lagre disse før du fortsetter?`;

            const modalOptions = {
                header: 'Ulagrede endringer',
                message: msg,
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            };

            this.modalService.confirm(modalOptions).onClose.subscribe(confirm => {
                if (confirm === ConfirmActions.ACCEPT) {
                    return this.session.saveChanges().subscribe(() => {
                        openModal();
                    });
                } else if (confirm === ConfirmActions.REJECT) {
                    openModal();
                }
            });
        } else {
            openModal();
        }
    }

    // TAGED FOR REMOVAL?
    getJournalCandidates(all: boolean = false): IMatchEntry[] {
        if (this.session.stage.length === 0 || all) {
            return this.session.bankEntries.filter( x => ((!x.StageGroupKey) && (!x.Closed)) );
        }
        const bankEntries = this.session.stage.filter( x => x.IsBankEntry);
        const journalEntries = this.session.stage.filter( x => !x.IsBankEntry);
        if (journalEntries.length === 0) { return bankEntries; }
        if (bankEntries.length > 0 && journalEntries.length > 0) {
            return [{ ID: -1, Date: bankEntries[0].Date,
                Amount: this.session.stageTotal, OpenAmount: this.session.stageTotal,
                Description: 'Restsum', IsBankEntry: true, Checked: true,
                Closed: false }];
        }
        return [];
    }

    openImportModal() {
        if (!this.loaded) { return; }
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

        const changePeriode = () => {
            if (this.selectedBankAccount) {
                this.loaded = false;
                this.cleanUp = this.session.totalTransactions > 100;
                if (offset) { this.bankPeriod = moment(this.bankPeriod).add(offset, 'months').toDate(); }
                const fromDate = moment(this.bankPeriod).startOf('month').toDate();
                const toDate = moment(this.bankPeriod).endOf('month').toDate();
                this.pageStateService.setPageState('accountid', this.selectedBankAccount.AccountID.toString());
                this.session.load(fromDate, toDate, this.selectedBankAccount.AccountID)
                    .finally( () => { this.cleanUp = false; this.loaded = true; } )
                    .subscribe(() => this.checkSuggest());
            }
        };

        if (this.session.closedGroups.length) {
            const msg = `Du har ${this.session.closedGroups.length} kobling${this.session.closedGroups.length > 1 ? 'er ' : ' '}` +
            `som ikke er lagret. Ønsker du å lagre disse før du fortsetter?`;

            const modalOptions = {
                header: 'Ulagrede endringer',
                message: msg,
                buttonLabels: {
                    accept: 'Lagre',
                    reject: 'Forkast',
                    cancel: 'Avbryt'
                }
            };

            this.modalService.confirm(modalOptions).onClose.subscribe(confirm => {
                if (confirm === ConfirmActions.ACCEPT) {
                    return this.session.saveChanges().subscribe(() => {
                        changePeriode();
                    });
                } else if (confirm === ConfirmActions.REJECT) {
                    changePeriode();
                }
            });
        } else {
            changePeriode();
        }
    }

    openSettings() {
        this.modalService.open(BankStatementSettings, { data: { settings: this.settings }}).onClose.subscribe(settings => {
            if (settings) {
                this.settings = settings;
                this.startAutoMatch();
            }
        });
    }

    closeStage() {
        this.session.closeStage();
        this.updateSaveActions();
        this.checkSuggest();
    }

    reset() {
        this.session.reset();
        setTimeout(() => {
            this.checkSuggest();
        });
    }

    sideMenuClose(event) {
        this.closedGroupDetailsVisible = false;
        setTimeout(() => {
            this.checkSuggest();
        });
        this.updateSaveActions();
    }

    checkSuggest(setFromUI = false) {
        if (this.autoSuggest) {
            this.session.tryNextSuggestion(undefined, this.settings);
        } else if (setFromUI) {
            this.session.clearStage();
        }
    }

    startAutoMatch() {
        if (!this.loaded) { return; }
        this.session.requestSuggestions(this.settings).subscribe(x => {
            while (true) {
                this.session.clearStage();
                if (this.session.tryNextSuggestion(x)) {
                    this.session.closeStage();
                } else {
                    this.updateSaveActions();
                    break;
                }
            }
        });
    }

    public canDeactivate(): boolean | Observable<boolean> {
        if (!this.session.closedGroups.length) {
            return true;
        }

        const msg = `Du har ${this.session.closedGroups.length} kobling${this.session.closedGroups.length > 1 ? 'er ' : ' '}` +
        `som ikke er lagret. Ønsker du å lagre disse før du fortsetter?`;

        const modalOptions = {
            header: 'Ulagrede endringer',
            message: msg,
            buttonLabels: {
                accept: 'Lagre',
                reject: 'Forkast',
                cancel: 'Avbryt'
            }
        };

        return this.modalService.confirm(modalOptions).onClose.switchMap(confirm => {
            if (confirm === ConfirmActions.ACCEPT) {
                return this.session.saveChanges()
                    .catch(err => Observable.of(false))
                    .map(res => true);
            }
            return Observable.of(confirm !== ConfirmActions.CANCEL);
        });
    }
}
