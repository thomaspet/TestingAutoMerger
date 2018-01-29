import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uniModal/interfaces';
import {CompanySettingsService} from '../../../../app/services/common/companySettingsService';
import * as moment from 'moment';

@Component({
    selector: 'confirm-credited-journalEntry-with-date-modal',
    template: `
        <section role="dialog" class="uni-modal"
            (clickOutside)="cancel()"
            (keydown.esc)="cancel()">
            <header>
                <h1 class="new">{{options.header}}</h1>
                <button class="modal-close-button" (click)="cancel()"></button>
            </header>

            <article>
                <section [innerHtml]="options.message"></section>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>
                <br>
                <p *ngIf="vatLockedDateReformatted">Mva er låst til dato: {{vatLockedDateReformatted}}</p>
                <p *ngIf="accountingLockedDateReformatted">Regnskap er låst til dato: {{accountingLockedDateReformatted}}</p>
                <br>
                <p>{{message}} </p>
                <br>
                <p>Velg dato:</p>
                <input type="date" [(ngModel)]="input">
                <p *ngIf="requiredInput" style="color:red">Fyll ut dato</p>
            </article>

            <footer>
                <button class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button class="cancel" (click)="cancel()">
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

    public input: Date | string;
    public requiredInput: boolean;
    public vatLockedDateReformatted: string;
    public accountingLockedDateReformatted: string;
    public message: string;

    constructor(private companySettingsService: CompanySettingsService) {}

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
        this.companySettingsService.getCompanySettings().subscribe(x => {
            const today = moment(new Date()).format('YYYY-MM-DD');
            let date: Date | string, greatestLockedDate: Date | string, message: string;

            // reformat the dates so its easier to read for the users(used in html)
            this.vatLockedDateReformatted = x.VatLockedDate ? moment(x.VatLockedDate).format('DD-MM-YYYY') : null;
            this.accountingLockedDateReformatted = x.AccountingLockedDate ? moment(x.AccountingLockedDate).format('DD-MM-YYYY') : null;

            if (x.VatLockedDate && x.AccountingLockedDate) {
                // find greatest of the two locked dates if they exist
                greatestLockedDate = moment(x.VatLockedDate) > moment(x.AccountingLockedDate) ? x.VatLockedDate : x.AccountingLockedDate;
            }

            if (this.options && this.options.data && this.options.data.VatDate) {
                // choose the greatest of the two dates as a suggestion to the user
                if (greatestLockedDate) {
                    message = moment(this.options.data.VatDate) > moment(greatestLockedDate)
                        ? 'Dato er satt til opprinnelig bilagsdato, du kan overstyre denne om du ønsker.'
                        : 'Dato er satt til låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(this.options.data.VatDate) > moment(greatestLockedDate)
                        ? this.options.data.VatDate
                        : moment(greatestLockedDate).add('days', 1).format('YYYY-MM-DD');

                } else if (!x.VatLockedDate && x.AccountingLockedDate) {
                    message = moment(this.options.data.VatDate) > moment(greatestLockedDate)
                        ? 'Dato er satt til opprinnelig bilagsdato, du kan overstyre denne om du ønsker.'
                        : 'Dato er satt til regnskaps-låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(this.options.data.VatDate) > moment(x.AccountingLockedDate)
                        ? this.options.data.VatDate
                        : moment(x.AccountingLockedDate).add('days', 1).format('YYYY-MM-DD');

                } else if (!x.AccountingLockedDate) {
                    message = moment(this.options.data.VatDate) > moment(x.VatLockedDate)
                        ? 'Dato er satt til opprinnelig bilagsdato, du kan overstyre denne om du ønsker.'
                        : 'Dato er satt til mva.-låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(this.options.data.VatDate) > moment(x.VatLockedDate)
                        ? this.options.data.VatDate
                        : moment(x.VatLockedDate).add('days', 1).format('YYYY-MM-DD');
                }
            } else {
                // choose a date 1 day after the locked period if no other date is selected already
                if (greatestLockedDate) {
                    message = 'Dato er satt til låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(greatestLockedDate).add('days', 1).format('YYYY-MM-DD');
                } else if (!x.VatLockedDate && x.AccountingLockedDate) {
                    message = 'Dato er satt til mva.-låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(x.AccountingLockedDate).add('days', 1).format('YYYY-MM-DD');
                } else if (!x.AccountingLockedDate) {
                    message = 'Dato er satt til regnskaps-låsedato + 1 dag, du kan overstyre denne om du ønsker.';
                    date = moment(x.VatLockedDate).add('days', 1).format('YYYY-MM-DD');
                }
            }

            if (!date) {
                // set todays date if no date is set already
                message = 'Dato er satt til dagens dato, du kan overstyre denne om du ønsker.';
                date = today;
            }
            this.message = message;
            this.input = date;
        });
    }

    public accept() {
        if (this.input) {
            return this.onClose.emit({input: this.input, action: ConfirmActions.ACCEPT});
        }
        return this.requiredInput = true;
    }

    public cancel() {
        this.onClose.emit({input: this.input, action: ConfirmActions.CANCEL});
    }
}
