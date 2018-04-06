import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'uni-unsaved-changes-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Ulagrede endringer</h1>
            </header>

            <article>
                <p>Du har ulagrede endringer. Ønsker du å forkaste disse?</p>
            </article>

            <footer>
                <button (click)="close(true)" class="bad">Forkast endringer</button>
                <button (click)="close(false)" class="warning">Avbryt</button>
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
