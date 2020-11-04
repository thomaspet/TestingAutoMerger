import { Component, OnDestroy, OnInit } from '@angular/core';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { ErrorService, UniTranslationService } from '@app/services/services';
import { IUniSaveAction } from '@uni-framework/save/save';
import { ConfirmActions, UniModalService } from '@uni-framework/uni-modal';
import { IUniTab } from '@uni-framework/uni-tabs';
import { ToastService, ToastTime, ToastType } from '@uni-framework/uniToast/toastService';
import { of, Subject } from 'rxjs';
import { catchError, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { IncomingBalanceBookingInfoModalComponent } from '../shared/components/incoming-balance-booking-info-modal/incoming-balance-booking-info-modal.component';
import { UnlockIncomingBalanceModalComponent } from '../shared/components/unlock-incoming-balance-modal/unlock-incoming-balance-modal.component';
import { IncomingBalanceNavigationService } from '../shared/services/incoming-balance-navigation.service';
import { IIncomingBalanceLine, IncomingBalanceStoreService } from '../services/incoming-balance-store.service';
import { IncomingBalanceDiffService } from './shared/services/incoming-balance-diff.service';

@Component({
    selector: 'uni-incoming-balance-wizard',
    templateUrl: './incoming-balance-wizard.component.html',
    styleUrls: ['./incoming-balance-wizard.component.sass']
})
export class IncomingBalanceWizardComponent implements OnInit, OnDestroy {
    routes: IUniTab[] = [];
    toolbar: IToolbarConfig;
    saveActions: IUniSaveAction[];
    destroy$: Subject<any> = new Subject();

    constructor(
        public navigationService: IncomingBalanceNavigationService,
        private stateService: IncomingBalanceStoreService,
        private diffService: IncomingBalanceDiffService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private translationService: UniTranslationService,
    ) { }

    ngOnInit(): void {
        this.routes = this.navigationService.getRouterTabs();
        this.stateService
            .initData()
            .subscribe();
        this.stateService
            .allJournalLines$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe(lines => this.toolbar = this.getToolbarConfig(lines));
        this.diffService
            .getAllDiffs()
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe(diffs => this.setSaveActions(diffs));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.stateService.clearData();
    }

    private saveDraft() {
        return this.stateService
            .saveDraftAndFetchData()
            .pipe(
                tap(() => this.toastService
                    .addToast(
                        this.translationService.translate('SETTINGS.INCOMING_BALANCE.MAIN.DRAFT_SAVE_CONFIRM_TOAST'),
                        ToastType.good,
                        ToastTime.medium,
                    )
                ),
            );
    }

    private getToolbarConfig(lines: IIncomingBalanceLine[]): IToolbarConfig {
        const config = {
            title: this.translationService.translate('SETTINGS.INCOMING_BALANCE.COMMON.TITLE'),
            buttons: [],
        };
        if (lines.some(line => line._isDirty)) {
            config.buttons.push({
                label: this.translationService.translate('SETTINGS.INCOMING_BALANCE.MAIN.SAVE_DRAFT_LABEL'),
                action: () => this.saveDraft(),
            });
        }
        return config;
    }

    private setSaveActions(diffs: number[]) {
        this.stateService
            .journalLines$
            .pipe(
                take(1)
            )
            .subscribe(lines => this.saveActions = this.getSaveActions(diffs, lines));
    }

    private getSaveActions(diffs: number[], lines: IIncomingBalanceLine[]): IUniSaveAction[] {
        if (lines.some(line => line._booked)) {
            return [
                {
                    label: this.translationService.translate('SETTINGS.INCOMING_BALANCE.MAIN.UNLOCK_LABEL'),
                    action: (done) => this.unlockAndFetch(done),
                }
            ];
        }
        return [
            {
                label: this.translationService.translate('SETTINGS.INCOMING_BALANCE.MAIN.BOOK_LABEL'),
                action: (done) => this.bookAndFetch(done),
                disabled: diffs.some(diff => diff !== 0),
            }
        ];
    }

    private bookAndFetch(done: (message?: string) => void) {
        this.stateService
            .bookAndFetchData()
            .pipe(
                tap(() => done()),
                switchMap((journalEntry) => this.modalService
                    .open(
                        IncomingBalanceBookingInfoModalComponent,
                        {data: journalEntry?.JournalEntryNumber, closeOnClickOutside: false, hideCloseButton: true}
                    )
                    .onClose
                ),
            )
            .subscribe(
                (shouldRoute) => shouldRoute && this.navigationService.toTab('balance'),
                err => {
                    this.errorService.handle(err);
                    done();
                },
            );
    }

    private unlockAndFetch(done: (message?: string) => void) {
        this.stateService
            .journalEntry$
            .pipe(
                take(1),
                switchMap(journalEntry => this.modalService
                    .open(UnlockIncomingBalanceModalComponent, {data: journalEntry?.JournalEntryNumber})
                    .onClose
                ),
                switchMap((result: ConfirmActions) => result === ConfirmActions.ACCEPT
                    ? this.stateService.unlockAndFetchData()
                    : of(null))
            )
            .subscribe(
                () => done(),
                err => {
                    this.errorService.handle(err);
                    done();
                }
            );
    }

}
