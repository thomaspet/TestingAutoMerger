import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {CompanySettingsService} from '../../../services/common/companySettingsService';
import {BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {CompanySettings} from '@uni-entities';
import {JournalEntryService} from '@app/services/services';
import {Observable} from 'rxjs';

@Component({
    selector: 'confirm-credited-journalEntry-with-date-modal',
    template: `
        <section role="dialog" class="uni-modal"
            (keydown.esc)="cancel()">
            <header>
                {{options.header}}
                <i (click)="cancel()" class="material-icons close-button" role="button">
                    close
                </i>
            </header>

            <article>
                <section *ngIf="!disableCreditButton" [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>
                <p *ngIf="vatLockedDateReformatted && showVatLockedDateInfo">MVA er låst til dato: {{vatLockedDateReformatted}}</p>
                <p *ngIf="accountingLockedDateReformatted && showAccountingLockedInfo">
                    Regnskap er låst til dato: {{accountingLockedDateReformatted}}
                </p>
                <p>{{message}}</p>
                <p *ngIf="relatedJournalEntriesMessage">{{relatedJournalEntriesMessage}}</p>
            </article>

            <footer>
                <button class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>

                <button *ngIf="!disableCreditButton"
                    class="c2a"
                    (click)="accept()"
                    [disabled]="!formReady">
                    {{options.buttonLabels.accept}}
                </button>
            </footer>
        </section>
    `
})
export class ConfirmCreditedJournalEntryWithDate implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    public vatLockedDateReformatted: string;
    public accountingLockedDateReformatted: string;
    public message: string;
    public relatedJournalEntriesMessage: string;

    public creditingData$: BehaviorSubject<{creditDate: Date | string}> = new BehaviorSubject({creditDate: null});

    public showVatLockedDateInfo: boolean = false;
    public showAccountingLockedInfo: boolean = false;
    public disableCreditButton: boolean = false;

    public formReady: boolean = false;

    constructor(
        private companySettingsService: CompanySettingsService,
        private journalEntryService: JournalEntryService
    ) {}

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }

        this.findNonLockedDate();
    }

    ngOnDestroy() {
        this.creditingData$.complete();
    }

    private findNonLockedDate() {
        const requests = [];
        requests.push(this.companySettingsService.getCompanySettings());

        // if the journalentryid is defined, get the minimum dates used on journalentrylines
        // for that journalentry - this is used to give the user better information about
        // what will happen if any of the dates are from before one of the lockdates
        if (this.options && this.options.data && this.options.data.JournalEntryID) {
            requests.push(this.journalEntryService.getMinDatesForJournalEntry(this.options.data.JournalEntryID));
            requests.push(this.journalEntryService.Get(this.options.data.JournalEntryID));
        }

        Observable.forkJoin(requests).subscribe(results => {
            const companySettings = <CompanySettings>results[0];

            let minVatDate = null;
            let minFinancialDate = null;
            let journalEntryNumber = null;

            if (results.length > 1 && results[1]) {
                minVatDate = (<any>results[1]).MinVatDate;
                minFinancialDate = (<any>results[1]).MinFinancialDate;
                journalEntryNumber = (<any>results[1]).JournalEntryNumber;
            }

            let relatedJournalEntryNumbersAccruals = null;
            this.relatedJournalEntriesMessage = null;

            if (results.length > 2 && (<any>results[2]).JournalEntryAccrualID) {
                this.journalEntryService
                    .getRelatedAccrualJournalEntries((<any>results[2]).JournalEntryAccrualID)
                    .subscribe(res => {
                        const allAccrualJournalEntries = res;

                        // Get an array of distinct journalentrynumbers not like the current journalentry.
                        // We need this to show a message to the user that he/she might also need to credit other
                        relatedJournalEntryNumbersAccruals =
                                Array.from(new Set(
                                    allAccrualJournalEntries
                                        .filter(x => x.JournalEntryNumber !== journalEntryNumber)
                                        .map(x => x.JournalEntryNumber)
                                ));

                        if (relatedJournalEntryNumbersAccruals.length > 0) {
                            this.relatedJournalEntriesMessage =
                                'OBS! Bilaget er periodisert, og følgende relatert bilag må eventuelt krediteres manuelt: '
                                + relatedJournalEntryNumbersAccruals.join(', ');
                        }
                    });
            }

            let message: string;

            this.vatLockedDateReformatted =
                companySettings.VatLockedDate ? moment(companySettings.VatLockedDate).format('DD.MM.YYYY') : null;
            this.accountingLockedDateReformatted =
                companySettings.AccountingLockedDate ? moment(companySettings.AccountingLockedDate).format('DD.MM.YYYY') : null;

            this.showAccountingLockedInfo = false;
            this.showVatLockedDateInfo = false;

            // check if any daters
            if (minFinancialDate && companySettings.AccountingLockedDate
                && moment(minFinancialDate).startOf('day') <= moment(companySettings.AccountingLockedDate).startOf('day')) {
                this.showAccountingLockedInfo = true;

            } if (minVatDate && companySettings.VatLockedDate
                && moment(minVatDate).startOf('day') <= moment(companySettings.VatLockedDate).startOf('day')) {
                this.showVatLockedDateInfo = true;
            }

            if (this.showAccountingLockedInfo || this.showVatLockedDateInfo) {
                message = 'Dersom du ønsker å kreditere dette bilaget må du låse opp regnskapet for gjeldende periode først.';
                this.options.buttonLabels.cancel = 'Ok';
                this.disableCreditButton = true;
                this.showVatLockedDateInfo = false;

            }


            if (!message) {
                // set todays date if no date is set already
                message = 'Bilaget vil bli kreditert på samme dato som bilagsdatoen. ';
            }

            this.message = message;

            const data = {
                creditDate: null
            };

            this.formReady = true;

            this.creditingData$.next(data);
        });
    }

    public accept() {
        const current = this.creditingData$.getValue();
        return this.onClose.emit({creditDate: current.creditDate, action: ConfirmActions.ACCEPT});
    }

    public cancel() {
        const current = this.creditingData$.getValue();
        this.onClose.emit({creditDate: current.creditDate, action: ConfirmActions.CANCEL});
    }
}
