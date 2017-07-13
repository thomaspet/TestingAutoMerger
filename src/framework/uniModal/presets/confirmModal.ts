import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../modalService';

@Component({
    selector: 'uni-confirm-modal-v2',
    template: `
        <dialog class="uni-modal" (clickOutside)="close(false)">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <main>
                <p>{{options.message}}</p>
            </main>

            <footer>
                <button (click)="close(true)" class="good">Ok</button>
                <button (click)="close(false)" class="bad">Avbryt</button>
            </footer>
        </dialog>
    `
})
export class UniConfirmModalV2 implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public close(value) {
        this.onClose.emit(value);
    }
}
