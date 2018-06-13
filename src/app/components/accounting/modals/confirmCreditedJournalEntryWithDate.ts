import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';
import {CompanySettingsService} from '../../../../app/services/common/companySettingsService';
import {Observable, BehaviorSubject} from 'rxjs';
import * as moment from 'moment';
import {LocalDate, CompanySettings} from '@uni-entities';
import {FieldType} from '../../../../framework/ui/uniform/index';
import { JournalEntryService } from '@app/services/services';

@Component({
    selector: 'confirm-credited-journalEntry-with-date-modal',
    template: `
        <section role="dialog" class="uni-modal"
            (keydown.esc)="cancel($event)">
            <header>
                <h1 class="new">{{options.header}}</h1>
                <button class="modal-close-button" (click)="cancel($event)"></button>
            </header>

            <article>
                <section [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>
                <p *ngIf="vatLockedDateReformatted && showVatLockedDateInfo">MVA er låst til dato: {{vatLockedDateReformatted}}</p>
                <p *ngIf="accountingLockedDateReformatted && showAccountingLockedInfo">
                    Regnskap er låst til dato: {{accountingLockedDateReformatted}}
                </p>
                <p>{{message}}</p>
                <br/>
                <uni-form
                    [config]="config$"
                    [fields]="fields$"
                    [model]="creditingData$">
                </uni-form>
                <br/>
                <p *ngIf="relatedJournalEntriesMessage">{{relatedJournalEntriesMessage}}</p>
            </article>

            <footer>
                <button class="good" id="good_button_ok" (click)="accept($event)" [disabled]="!formReady">
                    {{options.buttonLabels.accept}}
                </button>

                <button class="cancel" (click)="cancel($event)">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class ConfirmCreditedJournalEntryWithDate implements IUniModal, OnInit, AfterViewInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public vatLockedDateReformatted: string;
    public accountingLockedDateReformatted: string;
    public message: string;
    public relatedJournalEntriesMessage: string;

    public creditingData$: BehaviorSubject<{creditDate: Date | string}> = new BehaviorSubject({creditDate: null});
    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);


    public showVatLockedDateInfo: boolean = false;
    public showAccountingLockedInfo: boolean = false;

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

    public ngAfterViewInit() {
        setTimeout(function() {
            if (document.getElementById('good_button_ok')) {
                document.getElementById('good_button_ok').focus();
            }
        });
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
            if (minVatDate && minFinancialDate && companySettings.VatLockedDate && companySettings.AccountingLockedDate
                && moment(minVatDate) <= moment(companySettings.VatLockedDate)
                && moment(minFinancialDate) <= moment(companySettings.AccountingLockedDate)) {
                message = 'Bilagslinjer med regnskapsdato/MVA-dato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showAccountingLockedInfo = true;
                this.showVatLockedDateInfo = true;
            } else if (minFinancialDate && companySettings.AccountingLockedDate
                && moment(minFinancialDate) <= moment(companySettings.AccountingLockedDate)) {
                message = 'Bilagslinjer med regnskapsdato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showAccountingLockedInfo = true;
            } else if (minVatDate && companySettings.VatLockedDate
                && moment(minVatDate) <= moment(companySettings.VatLockedDate)) {
                message = 'Bilagslinjer med MVA dato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showVatLockedDateInfo = true;
            } else if (!minVatDate && !minFinancialDate && companySettings.AccountingLockedDate && companySettings.VatLockedDate) {
                message = 'Eventuelle bilagslinjer med regnskapsdato/MVA-dato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showAccountingLockedInfo = true;
                this.showVatLockedDateInfo = true;
            } else if (!minFinancialDate && companySettings.AccountingLockedDate) {
                message = 'Eventuelle bilagslinjer med regnskapsdato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showAccountingLockedInfo = true;
            } else if (!minVatDate && companySettings.VatLockedDate) {
                message = 'Eventuelle bilagslinjer med MVA dato før låsedato vil krediteres på dagen etter låsedato. ' +
                    'Du kan overstyre krediteringsdato for alle bilagslinjene ved å velge en dato under';

                this.showVatLockedDateInfo = true;
            }

            if (!message) {
                // set todays date if no date is set already
                message = 'Bilaget vil bli kreditert på samme dato som bilagsdatoen. ' +
                    'Du kan overstyre denne ved å velge en dato under.';
            }

            this.message = message;

            const data = {
                creditDate: null
            };

            this.formReady = true;

            this.creditingData$.next(data);
            this.fields$.next(this.getLayout().Fields);
        });
    }

    public accept(event) {
        const current = this.creditingData$.getValue();
        return this.onClose.emit({creditDate: current.creditDate, action: ConfirmActions.ACCEPT});
    }

    public cancel(event) {
        const current = this.creditingData$.getValue();
        this.onClose.emit({creditDate: current.creditDate, action: ConfirmActions.CANCEL});
    }

    private getLayout() {
        return {
            Name: 'TransqueryList',
            BaseEntity: 'Account',
            Fields: [
                {
                    EntityType: 'CreditData',
                    Property: 'creditDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Krediteringsdato',
                    Placeholder: 'Krediteringsdato'
                }
            ]
        };
    }
}
