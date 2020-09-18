import {Component, EventEmitter} from '@angular/core';
import {IModalOptions} from '../interfaces';
import {
    CompanySettingsService,
    ErrorService,
    ElsaProductService
} from '@app/services/services';
import {parse} from 'marked';

@Component({
    selector: 'activate-ocr-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{header}}</header>

            <article [innerHtml]="terms" class="scrollable"></article>

            <footer>
                <button class="secondary" (click)="onClose.emit(false)" [disabled]="busy">
                    Avbryt
                </button>
                <button class="c2a" (click)="activate()" [disabled]="busy || !terms?.length">
                    Aksepter
                </button>
            </footer>
        </section>
    `
})
export class ActivateOCRModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    header: string;
    terms: string;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private elsaProductService: ElsaProductService,
    ) {
        this.busy = true;
        this.elsaProductService.GetAll(`name eq 'OCR-SCAN'`).subscribe(product => {
            this.header = product[0].ProductAgreement?.Name || 'Fakturatolk avtale';
            this.terms = product[0].ProductAgreement?.AgreementText || '';
            this.terms = decodeURI(this.terms);
            this.terms = parse(this.terms);
            this.busy = false;
        },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    activate() {
        this.busy = true;
        this.companySettingsService.PostAction(1, 'accept-ocr-agreement').subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}

