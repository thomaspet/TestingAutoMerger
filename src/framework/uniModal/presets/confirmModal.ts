import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../modalService';

export enum ConfirmActions {
    ACCEPT,
    REJECT,
    CANCEL
};

@Component({
    selector: 'uni-confirm-modal-v2',
    template: `
        <dialog class="uni-modal" (clickOutside)="close()">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <main>
                <p>{{options.message}}</p>
            </main>

            <footer>
                <button *ngFor="let button of options.buttons"
                    (click)="onButtonClick(button)"
                    [ngClass]="button.class">
                    {{button.label}}
                </button>
            </footer>
        </dialog>
    `
})
export class UniConfirmModalV2 implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public ngOnInit() {
        if (!this.options.buttons) {
            this.options.buttons = [
                {
                    label: 'Ok',
                    class: 'good',
                    action: () => this.close(ConfirmActions.ACCEPT)
                },
                {
                    label: 'Avbryt',
                    class: 'warning',
                    action: () => this.close(ConfirmActions.CANCEL)
                }
            ];
        }
    }

    public onButtonClick(button) {
        button.action(this);
    }

    public close(value = ConfirmActions.CANCEL) {
        this.onClose.emit(value);
    }
}
