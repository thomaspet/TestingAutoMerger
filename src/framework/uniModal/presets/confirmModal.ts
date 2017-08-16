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
        <dialog class="uni-modal"
                (clickOutside)="clickOutsideCancel()"
                (keydown.esc)="cancel()">
            <header>
                <h1 class="new">{{options.header}}</h1>
            </header>

            <main>
                <p>{{options.message}}</p>
                <p class="warn" *ngIf="options.warning">
                    {{options.warning}}
                </p>
            </main>

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.reject" class="bad" (click)="reject()">
                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
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
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }
    }

    public accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    public clickOutsideCancel() {
        if (this.options.activateClickOutside == false) {return};
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
