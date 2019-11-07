import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-unsaved-changes-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Ulagrede endringer</header>

            <article>
                <p>Du har ulagrede endringer. Ønsker du å forkaste disse?</p>
            </article>

            <footer>
                <button (click)="close(false)" class="secondary">Avbryt</button>
                <button (click)="close(true)" class="bad">Forkast endringer</button>
            </footer>
        </section>
    `
})
export class UniUnsavedChangesModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public close(value) {
        this.onClose.emit(value);
    }
}
