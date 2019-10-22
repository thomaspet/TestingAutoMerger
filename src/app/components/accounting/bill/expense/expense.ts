import { Component, OnInit, ViewChild } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BankJournalSession, DebitCreditEntry, ErrorService, PageStateService, PaymentMode } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { Router } from '@angular/router';
import { ExpensePrepaid } from './prepaid/prepaid';
export { ExpensePrepaid } from './prepaid/prepaid';
export { ExpenseEntries } from './entries/entries';
export { ExpensePayable } from './payable/payable';

@Component({
    selector: 'expense',
    templateUrl: './expense.html',
    styleUrls: [ './expense.sass' ]
})
export class Expense implements OnInit {
    @ViewChild(ExpensePrepaid) prepaidView: ExpensePrepaid;

    busy = true;
    viewModePayable = false;

    public saveActions: IUniSaveAction[] = [{
        label: 'Lagre',
        action: (done) => setTimeout(() => this.save().then(() => done())), main: true, disabled: false
    }, {
        label: 'Nytt bilag',
        action: (done) => setTimeout(() => { this.clear(); done(); }), main: true, disabled: false
    }];

    public toolbarConfig: IToolbarConfig = {
        title: this.getTitle(), omitFinalCrumb: true
    };

    constructor(
        public session: BankJournalSession,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private tabService: TabService,
        private toast: ToastService,
        private router: Router) {
        session.initialize()
            .finally( () => this.busy = false)
            .subscribe( () => this.sessionReady() );

        this.tabService.addTab({
            name: 'NAVBAR.EXPENSE',
            url: '/accounting/expense',
            moduleID: UniModules.Bills,
            active: true
        });

        this.checkPath();
    }

    private getTitle(): string {
        return this.viewModePayable ? 'Kvittering - tilbakebetaling' : 'Kvittering - forhåndsbetalt';
    }

    ngOnInit() {
        this.clear();
    }

    sessionReady() {
        this.session.payment.Mode = PaymentMode.PrepaidWithCompanyBankAccount;
    }

    private checkPath() {
        const params = this.pageStateService.getPageState();
        if (params.filter) {

        }
    }

    save(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            // Validation
            this.session.recalc();
            const validation = this.session.validate();
            if (validation.success === false) {
                this.toast.addToast('Sum: ' + this.session.balance, ToastType.bad, 6, validation.messages[0]);
                resolve(false);
                return;
            }

            // this.dumpExpense();
            // resolve(true);
            // return;

            // Save
            this.session.save()
                .finally(() => resolve(true))
                .subscribe( x => {
                    const jnr = (x && x.length > 0) ? x[0].JournalEntryNumber : undefined;
                    if (jnr) {
                        this.toast.addToast(`Utført`, ToastType.good, 5, `Utlegg bokført som bilag nr. ${jnr}`,
                            { label: 'Vis bilaget',
                            click: () => {
                                const jNum = jnr.split('-')[0];
                                const jYr = jnr.split('-')[1];
                                this.router.navigateByUrl(`/accounting/transquery?JournalEntryNumber=${jNum}&AccountYear=${jYr}`);
                            },
                            displayInHeader: true });
                        this.clear();
                    } else {
                        this.toast.addToast(`Utført`, ToastType.warn, 5, `Noe gikk galt. Finner ikke bilagsnummeret.`);
                    }
                }, err => this.errorService.handle(err));

        });
    }

    dumpExpense() {
        const xpL = this.session.convertToExpense();
        if (xpL && xpL.length > 0) {
            const xp = xpL[0];
            console.log(xp);
            console.table(xp.DraftLines);
        }
    }

    clear() {
        this.session.clear();
        this.checkPaymentMode(true);
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    flipViewMode() {
        this.viewModePayable = !this.viewModePayable;
        this.checkPaymentMode();
        this.toolbarConfig.title = this.getTitle();
    }

    checkPaymentMode(reset = false) {
        this.session.payment.Mode = this.viewModePayable ? PaymentMode.PrepaidByEmployee : PaymentMode.PrepaidWithCompanyBankAccount;
        if (reset && this.session.payment.Mode === PaymentMode.PrepaidWithCompanyBankAccount) {
            if (this.prepaidView) {
                this.prepaidView.clear();
            }
        }
    }

}
