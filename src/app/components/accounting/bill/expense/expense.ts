import { Component, OnInit, ViewChild } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BankJournalSession, DebitCreditEntry, ErrorService, PageStateService, PaymentMode } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';
import { ExpenseSummaryModal } from './summary/summary';
export { ExpenseSummaryModal } from './summary/summary';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpensePrepaid } from './prepaid/prepaid';
export { ExpensePrepaid } from './prepaid/prepaid';
export { ExpenseEntries } from './entries/entries';
export { ExpensePayable } from './payable/payable';
import { UniImage } from '@uni-framework/uniImage/uniImage';
import { UniModalService } from '@uni-framework/uni-modal';
import { FileFromInboxModal } from '../../modals/file-from-inbox-modal/file-from-inbox-modal';

@Component({
    selector: 'expense',
    templateUrl: './expense.html',
    styleUrls: [ './expense.sass' ]
})
export class Expense implements OnInit {
    @ViewChild(ExpensePrepaid) prepaidView: ExpensePrepaid;
    @ViewChild(UniImage) public uniImage: UniImage;

    busy = true;
    fileIds: number[] = [];

    public saveActions: IUniSaveAction[] = [{
        label: 'Bokfør',
        action: (done) => setTimeout(() => this.save(true).then( () => done() )), main: true, disabled: false
    }];
    // , {
    //     label: 'Nullstill',
    //     action: (done) => setTimeout(() => { this.clear(); done(); }), main: true, disabled: false
    // }];

    public toolbarConfig: IToolbarConfig;

    constructor(
        public session: BankJournalSession,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private tabService: TabService,
        private toast: ToastService,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: UniModalService
    ) {

        this.route.queryParams.subscribe(params => {
            if (params && params.fileid) {
                this.fileIds.push(+params.fileid);
            }

            const mode = +params.mode || PaymentMode.PrepaidByEmployee;

            session.initialize(mode)
                .finally( () => this.busy = false)
                .subscribe( () => this.setupToolbarConfig() );

            this.tabService.addTab({
                name: 'NAVBAR.EXPENSE',
                url: this.pageStateService.getUrl(),
                moduleID: UniModules.Bills,
                active: true
            });
        });
    }

    setupToolbarConfig() {
        this.toolbarConfig =  {
            omitFinalCrumb: true,
            title: this.getTitle()
        };
        if (this.session.payment.Mode === PaymentMode.PrepaidByEmployee) {
            this.toolbarConfig.buttons = [{
                label: 'Bokfør',
                action: () => this.save(false),
            }];
        }
    }

    private getTitle(): string {
        return this.session.payment.Mode === PaymentMode.PrepaidByEmployee ? 'Utlegg - tilbakebetaling' : 'Kvittering - forhåndsbetalt';
    }

    ngOnInit() {
        this.clear();
    }

    sessionReady() {
        // Do something here?
    }

    public openAddFileModal() {
        this.modalService.open(FileFromInboxModal).onClose.subscribe(file => {
            if (!file) {
                return;
            }

            if (this.fileIds.length) {
                this.uniImage.fetchDocumentWithID(file.ID);
            } else {
                this.fileIds = [file.ID];
            }
        });
    }

    save(withPayment = false): Promise<boolean> {

        // Payment only possible with mode == PaymentMode.PrepaidByEmployee
        const createPayment = withPayment && this.session.payment.Mode === PaymentMode.PrepaidByEmployee;

        return new Promise((resolve, reject) => {

            // Validation
            this.session.recalc();
            const validation = this.session.validate(createPayment);
            if (validation.success === false) {
                this.toast.addToast(validation.messages[0], ToastType.bad, 4);
                resolve(false);
                return;
            }

            this.setDefaultText();

            // Ask user to confirm before saving
            this.openSummary(createPayment).then( ok => {
                if (ok) {
                    this.session.save(false, this.fileIds, createPayment).subscribe( x => {
                        this.showSavedJournalToast(x, createPayment);
                        resolve(true);
                    }, err => {
                        this.errorService.handle(err);
                        resolve(false);
                    });
                } else {
                    resolve(false);
                }
            });

        });
    }

    setDefaultText() {
        let userInput = (this.session.items.length > 0 ? this.session.items[0].Description : '');
        switch (this.session.payment.Mode) {
            case PaymentMode.PrepaidByEmployee:
                userInput = userInput || `Til: ${this.session.payment.PaymentTo.AccountName}`;
                break;
            default:
                break;
        }
        this.session.payment.Description = userInput || 'Utlegg';
    }

    showSavedJournalToast(response: Array<{ JournalEntryNumber: string }>, withPayment = false) {
        const jnr = (response && response.length > 0) ? response[0].JournalEntryNumber : undefined;
        const jNum = jnr.split('-')[0];
        const jYr = jnr.split('-')[1];

        let msg = `Utlegg bokført som <a href="/#/accounting/transquery?JournalEntryNumber=${jNum}&`
        + `AccountYear=${jYr}">bilagsnr. ${jnr}</a>`;
        msg += withPayment ? ', og er sendt til betalingslisten.' : '';

        // Only show action when payment..
        const action = withPayment ? {
            label: 'Gå til betalingslisten',
            click: () => {
                this.router.navigateByUrl(`/bank/ticker?code=payment_list`);
            },
            displayInHeader: true
        } : null;

        if (jnr) {
            this.toast.addToast(`Utført`, ToastType.good, 10, msg, action);
            this.clear();
        } else {
            this.toast.addToast(`Utført`, ToastType.warn, 5, `Noe gikk galt. Finner ikke bilagsnummeret.`);
        }
    }

    openSummary(withPayment = false) {
        return new Promise((resolve, reject) => {
            const xpl = this.session.convertToExpense(this.fileIds);
            if (xpl === undefined || xpl.length === 0) { resolve(false); return; }
            this.modalService.open(ExpenseSummaryModal, {
                data: {
                    session: this.session,
                    withPayment: withPayment
                }
            }).onClose.subscribe(value => {
                resolve(value);
            });
        });
    }

    clear() {
        this.session.clear();
        this.checkPaymentMode(true);
        this.session.payment.PaymentDate = new Date();
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    checkPaymentMode(reset = false) {
        switch (this.session.payment.Mode) {
            case PaymentMode.PrepaidWithCompanyBankAccount:
                    this.saveActions[0].label = 'Bokfør';
                if (reset && this.prepaidView) {
                    this.prepaidView.clear();
                }
                break;
            case PaymentMode.PrepaidByEmployee:
                this.saveActions[0].label = 'Bokfør og lag utbetaling';
                break;
        }
    }

    onFileSplitCompleted() {
        // todo: add some handler here
    }

}
