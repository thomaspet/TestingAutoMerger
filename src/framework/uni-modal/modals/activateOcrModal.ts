import {Component, EventEmitter} from '@angular/core';
import {IModalOptions} from '../interfaces';
import {
    CompanySettingsService,
    AgreementService,
    ErrorService,
} from '@app/services/services';

@Component({
    selector: 'activate-ocr-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header><h1>Aktiver OCR-scan</h1></header>

            <article [innerHtml]="terms" class="scrollable"></article>

            <footer>
                <button class="good" (click)="activate()" [disabled]="busy || !terms?.length">
                    Aksepter
                </button>
                <button class="warning" (click)="onClose.emit(false)" [disabled]="busy">
                    Avbryt
                </button>
            </footer>
        </section>
    `
})
export class ActivateOCRModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    terms: string;
    busy: boolean;

    constructor(
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
        private agreementService: AgreementService
    ) {
        this.agreementService.Current('OCR').subscribe(
            terms => this.terms = terms,
            err => this.errorService.handle(err)
        );
    }

    activate() {
        this.busy = true;
        this.companySettingsService.PostAction(1, 'accept-ocr-agreement').subscribe(
            () => this.onClose.emit(true),
            err => this.errorService.handle(err),
            () => this.busy = false
        );
    }
}

