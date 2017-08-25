import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../modalService';

@Component({
    selector: 'uni-unsaved-changes-modal',
    template: `
        <dialog class="uni-modal">
            <header>
                <h1>Ulagrede endringer</h1>
            </header>

            <main>
                <p>Du har ulagrede endringer. Ønsker du å forkaste disse?</p>
            </main>

            <footer>
                <button (click)="close(true)" class="bad">Forkast endringer</button>
                <button (click)="close(false)" class="warning">Avbryt</button>
            </footer>
        </dialog>
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
