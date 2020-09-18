import {Component, EventEmitter, Input} from '@angular/core';
import {IModalOptions} from '../interfaces';
import {
    CompanySettingsService,
    ErrorService,
} from '@app/services/services';
import {parse} from 'marked';
import {ElsaProduct} from '@app/models';

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
                <button class="c2a" (click)="activate()" [disabled]="busy">
                    Aksepter
                </button>
            </footer>
        </section>
    `
})
export class ActivateOCRModal {
    @Input()
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    header: string;
    terms: string;
    busy: boolean;
    product: ElsaProduct;

    constructor(
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
    ) {}

    ngOnInit() {
        this.product = this.options.data;
        this.header = this.product.ProductAgreement?.Name || 'Fakturatolk avtale';
        this.terms = this.product.ProductAgreement?.AgreementText || '';
        this.terms = decodeURI(this.terms);
        this.terms = parse(this.terms);
    }

    activate() {
        this.busy = true;
        this.companySettingsService.PostAction(1, 'accept-ocr-agreement').subscribe(
            () => this.onClose.emit(true),
            err => {
                this.errorService.handle(err);
                this.busy = false;
                this.onClose.emit(false);
            }
        );
    }
}

