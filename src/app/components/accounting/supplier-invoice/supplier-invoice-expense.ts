import {Component, ViewChild} from '@angular/core';
import {SupplierInvoiceStore} from './supplier-invoice-store';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {DetailsFormExpense} from './components/details-form-expense/details-form-expense';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { IUniSaveAction } from '@uni-framework/save/save';
import { PaymentMode } from '@app/services/bank/bankjournalmodels';
import { theme, THEMES } from 'src/themes/theme';
import { FinancialYearService } from '@app/services/services';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'supplier-invoice-expense',
    templateUrl: './supplier-invoice-expense.html',
    styleUrls: ['supplier-invoice.sass']
})

export class SupplierInvoiceExpense {

    @ViewChild(DetailsFormExpense) detailsForm: DetailsFormExpense;

    onDestroy$ = new Subject();
    currentMode: number = 2;
    toolbarconfig: IToolbarConfig = {};
    saveActions: IUniSaveAction[] = [];

    constructor(
        public store: SupplierInvoiceStore,
        private activeRoute: ActivatedRoute,
        private financialYearSerice: FinancialYearService,
        private toastService: ToastService,
    ) {
        this.activeRoute.paramMap.pipe(
            takeUntil(this.onDestroy$)
        ).subscribe(params => {

            const fileID = +this.activeRoute.snapshot.queryParamMap.get('fileid');
            this.currentMode = +this.activeRoute.snapshot.queryParamMap.get('mode');
            if (fileID) {
                this.store.startupFileID$.next(fileID);
            }
            this.store.init(0, this.currentMode);
            this.store.invoice$.takeUntil(this.onDestroy$).subscribe((invoice) => this.setUpSaveActions());
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    setUpSaveActions() {
        if (!this.store.companySettings) {
            return;
        }

        if (this.currentMode === PaymentMode.PrepaidByEmployee) {
            if (theme.theme === THEMES.EXT02 && !this.store.companySettings.HasAutobank) {
                this.saveActions = [{
                    label: 'Bokfør og registrer utbetaling',
                    action: (done) => {
                        this.saveJournalAndPay(done);
                    }
                }];
            } else {
                this.saveActions = [{
                    label: 'Bokfør og betal',
                    action: (done) => {
                        this.saveJournalAndPay(done, false);
                    }
                }];
            }
        } else {
            this.saveActions = [{
                label: 'Bokfør',
                action: (done) => {
                    this.saveJournalAndPay(done);
                }
            }];
        }

        this.toolbarconfig = {
            omitFinalCrumb: true,
            title: 'Utgift - ' + (this.currentMode === PaymentMode.PrepaidByEmployee ? 'Tilbakebetaling' : 'Forhåndsbetalt'),
            buttons: (this.currentMode === PaymentMode.PrepaidByEmployee)
                ? [{ label: 'Bokfør', action: () => this.saveJournalAndPay(null, false, true) }]
                : undefined
        };
    }

    // This should be a backend function that can roll back!
    saveJournalAndPay(done, isAlreadyPaid: boolean = true, onlyJournal: boolean = false) {
        this.store.prepExpenseForSave(this.detailsForm.date);

        if (this.detailsForm.date.getFullYear() !== this.financialYearSerice.getActiveYear()) {
            this.toastService.addToast('Kan ikke bokføre utgift', ToastType.warn, 8, 'Kan ikke bokføre utgift som ikke er innefor valgt regnskapsår. Hvis dato er korrekt, må du bytte regnskapsår før du kan bokføre.');
            done();
            return;
        }

        this.store.saveChanges().subscribe(i => {
            this.store.invoice$.next(i);
            if (isAlreadyPaid) {
                this.store.registerExpensePayment().subscribe((data) => {
                    this.store.showSavedJournalToast(data);
                    done();
                });
            } else if (onlyJournal) {
                this.store.journalExpense().subscribe((data) => {
                    this.store.showSavedJournalToast(data);
                }, err => {
                    this.saveActions = [];
                });
            } else {
                this.store.sendExpenseToPayment().subscribe((data) => {
                    this.store.showSavedJournalToast(data, true);
                    done();
                }, err => {
                    this.saveActions = [];
                    done(err);
                });
            }
        }, err => { done(err); });
    }
}
