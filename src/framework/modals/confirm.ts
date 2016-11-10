import {UniComponentLoader} from '../core/componentLoader';
import {Component, Input, ViewChild} from '@angular/core';
import {UniModal} from './modal';

export interface IModalAction {
    text: string;
    method: Function;
}

export interface IUniConfirmModalConfig {
    title?: string;
    message?: string;
    hasCancel?: boolean;
    actions?: {
        accept?: IModalAction,
        reject?: IModalAction
    };
}

@Component({
    selector: 'uni-confirm-content',
    template: `
        <article class='modal-content'>
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            {{config.message}}
            <footer>
                <button *ngIf="config?.actions?.accept" (click)="runMethod('accept')" class="good">
                    {{config?.actions?.accept?.text}}
                </button>
                <button *ngIf="config?.actions?.reject" (click)="runMethod('reject')" class="bad">
                    {{config?.actions?.reject?.text}}
                </button>
                <button *ngIf="config?.hasCancel" (click)="modal.close()">
                    Avbryt
                </button>
            </footer>
        </article>
    `
})
export class UniConfirmContent {
    @Input('config')
    config: IUniConfirmModalConfig;

    public runMethod(action) {
        this.config.actions[action].method();
    }
}

@Component({
    selector: 'uni-confirm-modal',
    template: `<uni-modal [type]="type" [config]="config"></uni-modal>`
})
export class UniConfirmModal {

    public type: any = UniConfirmContent;

    @ViewChild(UniModal)
    modal: UniModal;

    @Input()
    public config: any;

    public open() {
        this.modal.open();
    }

    public close() {
        this.modal.close();
    }

    public content() {
        this.modal.getContent();
    }
}
