import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {
    UniModalService,
    IModalOptions,
    IUniModal,
    UniConfirmModalV2,
    ConfirmActions
} from '@uni-framework/uni-modal';
import {UniAutobankAgreementModal} from './autobankAgreementModal';

@Component({
    selector: 'uni-agreement-warning-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 70vw;">
            <header><h1>avtalen advarsel</h1></header>
            <article>
                <p>Vennligst godta avtalen før du fortsetter</p>
            </article>
            <footer>
                <button (click)="close()" class="bad">Lukk</button>
            </footer>
        </section>
    `
})

export class UniAgreementWarningModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public agreements: any[];

    public close() {
        this.onClose.emit();
    }
}
