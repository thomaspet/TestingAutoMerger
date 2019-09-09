import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from './../../../../../framework/uni-modal';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'uni-print-modal',
    template: `<section class="uni-modal large">
        <header>Skriv ut</header>
        <article>
            <iframe
                style="min-height: 80vh; min-width: 87vw;"
                type="application/pdf"
                [src]="returnUrl()"
                frameborder="0"
                webkitallowfullscreen
                mozallowfullscreen
                allowfullscreen>
            </iframe>
        </article>
        <footer>
            <button (click)="onCloseAction()">Cancel</button>
        </footer>
    </section>`
})

export class UniPrintModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    constructor(public sanitizer: DomSanitizer) {}

    public onCloseAction() {
        this.onClose.emit(false);
    }

    public returnUrl() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.options.data.url);
    }
}
