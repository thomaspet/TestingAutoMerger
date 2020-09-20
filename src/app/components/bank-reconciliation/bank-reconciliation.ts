import {Component, ErrorHandler} from '@angular/core';
import {TabService, UniModules} from '../layout/navbar/tabstrip/tabService';
import {catchError} from 'rxjs/operators';
import {StatisticsService, BankAccountService, PageStateService} from '@app/services/services';
import {BankAccount, BankStatementMatch} from '@uni-entities';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IContextMenuItem} from '@uni-framework/ui/unitable/index';
import {IToolbarConfig} from '../common/toolbar/toolbar';
import {BankStatementSession, IMatchEntry, JournalEntryListMode} from '@app/services/bank/bankstatementsession';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {BankStatementUploadModal} from './bank-statement-upload-modal/bank-statement-upload-modal';
import {JournalEntryFromAccountModal} from './journal-entry-from-account-modal/journal-entry-from-account-modal';
import {BankStatementJournalModal} from './bank-statement-journal/bank-statement-journal-modal';
import {BankStatementSettings} from './bank-statement-settings/bank-statement-settings';
import * as moment from 'moment';
import {Observable, of} from 'rxjs';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {FeaturePermissionService} from '@app/featurePermissionService';

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
    selectedClosedItem;
    bankPeriod: Date;
    reconcileStartDate: Date;
    journalEntryPeriod: Date;
    autoSuggest = true;
    cleanUp = false;
    loaded = false;
    closedGroupDetailsVisible = false;
    settings = { MaxDayOffset: 5, MaxDelta: 0.0 };

    contextMenuItems: IContextMenuItem[] = [];
    toolbarconfig: IToolbarConfig = this.setToolbarConfig();
    saveactions: IUniSaveAction[] = [];

    sub;

    constructor(
        tabService: TabService,
        private statisticsService: StatisticsService,
        private bankAccountService: BankAccountService,
        private errorHandler: ErrorHandler,
        private modalService: UniModalService,
        public session: BankStatementSession,
        private pageStateService: PageStateService,
        private toastService: ToastService,
        private permissionService: FeaturePermissionService,
    ) {
        tabService.addTab({
            url: '/bank/reconciliationmatch',
            name: 'Bankavstemming',
            active: true,
            moduleID: UniModules.BankReconciliation
        });

        this.initData();
        this.updateSaveActions();

        this.sub = this.session.cantAddEntry.subscribe(msg => {
            if (msg) {
                this.toastService.addToast('Kan ikke markere post', ToastType.info, 7, msg);
            }
        });
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    updateSaveActions() {
        if (this.permissionService.canShowUiFeature('ui.bank.reconciliation.auto-match')) {
            this.saveactions = [{
                label: 'Avstem automatisk',
                action: done => this.openSettings(done),
                disabled: this.session.journalEntryMode !== JournalEntryListMode.Original
            }];
        }
    }

    save(done?) {
        if (this.saveBusy) {
            if (done) { done(''); }
            return;
        }

        this.closedGroupDetailsVisible = false;
        this.saveBusy = true;
        this.session.saveChanges().subscribe(() => {

            this.saveBusy = false;
            setTimeout(() => {
                this.checkSuggest();

                if (done) {
                    done('Poster avstemt');
                }
            });

        }, err => {
            this.errorHandler.handleError(err);
            this.saveBusy = false;
            if (done) {
                done();
            }
        });
    }

    onItemSelect(item) {
        if (item.Closed) {
            this.selectedClosedItem = item;
            this.closedGroupDetailsVisible = true;
        } else {
            this.session.checkOrUncheck(item);
        }
    }

    initData() {
        this.session.clear();
        this.bankAccountService.GetAll('expand=Account,Bank&filter=CompanySettingsID gt 0 and AccountID gt 0 and Account.Locked eq false')
            .subscribe(
                accounts => {
                    this.bankAccounts = accounts || [];
                    if (this.bankAccounts.length) {

                        this.selectedBankAccount = this.bankAccounts[0];

                        // Set current account from routeparam ? (?accountd=123)
                        const state = this.pageStateService.getPageState();
                        if (state.accountid) {
                            const acc = this.bankAccounts.find(x => x.AccountID === parseInt(state.accountid, 10));
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
                closeOnEscape: false,
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
                    this.onAccountChange();
                }
            }
        });
    }

    onAccountChange() {
        this.reconcileStartDate = undefined;
        this.session.ledgerAccountID = this.selectedBankAccount.AccountID;
        const firstUnreconciledOdata = `model=BankStatementEntry`
            + `&select=min(casewhen(isnull(StatusCode,48001) lt 48002,bookingdate,getdate())) as FirstUnreconciled`
            + `,min(bookingdate) as FirstItem`
            + `&filter=BankStatement.AccountID eq ${this.selectedBankAccount.AccountID}`
            + `&expand=BankStatement`;

        this.statisticsService.GetAllUnwrapped(firstUnreconciledOdata).pipe(
            catchError(() => of(new Date()))
        ).subscribe(
            res => {
                const firstUnreconciled = res && res[0] && res[0].FirstUnreconciled;
                const date = firstUnreconciled ? new Date(firstUnreconciled) : new Date();
                date.setDate(1); // always use first day of period
                this.reconcileStartDate = res && res[0] && res[0].FirstItem || date;
                this.bankPeriod = date;
                this.journalEntryPeriod = date;
                this.onBankPeriodChange();
                this.toolbarconfig = this.setToolbarConfig();
            }
        );
    }

    changeMode(mode: number) {
        this.session.selectJournalEntries(mode);
        this.updateSaveActions();
        this.checkSuggest();
    }

    onDateChange(date: Date) {

        const fromDate = moment(date).startOf('month').toDate();
        const toDate = moment(date).endOf('month').toDate();
        this.session.hasCheckedOpenPosts = this.session.journalEntryMode !== JournalEntryListMode.Original;

        this.session
        .load(fromDate, toDate, this.selectedBankAccount.AccountID, this.reconcileStartDate)
        .finally(() => {
            this.cleanUp = false;
            this.loaded = true;
        })
        .subscribe(() => this.checkSuggest());
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
                this.session.load(fromDate, toDate, this.selectedBankAccount.AccountID, this.reconcileStartDate)
                    .finally(() => {
                        this.cleanUp = false;
                        this.loaded = true;
                    })
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

    openSettings(done?) {
        this.modalService.open(BankStatementSettings, { data: { settings: this.settings }}).onClose.subscribe(settings => {
            if (settings) {
                this.settings = settings;
                this.startAutoMatch(done);
            } else {
                done('');
            }
        });
    }

    closeStage() {
        this.session.preparing = true;

        this.session.closeStage().then((response) => {
            if (response) {
                if (this.session.journalEntryMode !== JournalEntryListMode.Original) {
                    // If one of the matches is on same side, dont allow it in SubAccount view!
                    if (response.filter(res => !res.BankStatementEntryID || !res.JournalEntryLineID).length) {
                        const link = `<a href="/#/accounting/postpost?register=${this.session.journalEntryMode === 1 ? 'customer' : 'supplier'}&name=&search=&postsearch=&tabindex=0&maintabindex=0">gå til Utestående</a>`;

                        this.toastService.addToast('Avstemming avbrutt', ToastType.warn, 15,
                        `Kan ikke matche poster på samme side når du ser ${this.session.journalEntryMode === 1 ? 'kunde' : 'leverandør'}poster på høyresiden. `
                        + `Trykk på regnskap for å matche bankposter, eller ${link} for å postpost-anmerke`);
                        this.session.preparing = false;
                        this.reset();
                    } else {
                        this.openJournalAndPostpostModal(response);
                    }
                } else {
                    this.save();
                }
            } else {
                // No changes was done, just need to stop showing busy indicator
                this.session.preparing = false;
            }
        });
    }

    openJournalAndPostpostModal(matches) {
        // Response : boolean -> true = saved, false = cancelled
        this.modalService.open(JournalEntryFromAccountModal,
            { data: {
                matches: matches,
                selectedBankAccount: this.selectedBankAccount,
                mode: this.session.journalEntryMode
            }, closeOnClickOutside: false })
        .onClose.subscribe(response => {
            if (response) {
                this.session.reload().subscribe(() => {
                    this.checkSuggest();
                    this.toastService.hideLoadIndicator();
                });
            } else {
                this.session.preparing = false;
                this.reset();
            }
        });
    }

    reset() {
        this.session.reset();
        setTimeout(() => {
            this.checkSuggest();
        });
    }

    sideMenuClose(event) {
        this.closedGroupDetailsVisible = false;

        if (event) {
            this.session.reload().subscribe(() => this.checkSuggest());
        }
    }

    checkSuggest(forceNewPostPostCheck = false) {
        if (this.autoSuggest) {
            this.session.tryNextSuggestion(undefined, this.settings, forceNewPostPostCheck);
        }
    }

    startAutoMatch(done?) {
        if (!this.loaded) { done(''); return; }
        this.session.requestSuggestions(this.settings).subscribe(x => {
            while (true) {
                this.session.clearStage();
                if (this.session.tryNextSuggestion(x)) {
                    this.session.closeStage();
                } else {
                    this.save(done);
                    break;
                }
            }
        });
    }

    setToolbarConfig(): IToolbarConfig {
        return {
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
                },
                {
                    label: 'Se etter match-forslag',
                    action: () => { this.checkSuggest(true); }
                }
            ],
            period: this.bankPeriod
        };
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
