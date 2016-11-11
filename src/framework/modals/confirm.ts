import {Component, Input, ViewChild} from '@angular/core';
import {UniModal} from './modal';

export enum ConfirmActions {
    ACCEPT,
    REJECT,
    CANCEL
};

export interface IModalAction {
    text: string;
    method: Function;
}

export interface IUniConfirmModalConfig {
    title?: string;
    message?: string;
    wariningMessage?: string;
    actions?: {
        accept?: IModalAction,
        reject?: IModalAction,
        cancel?: IModalAction
    };
}

@Component({
    selector: 'uni-confirm-content',
    template: `
        <article class='modal-content'>
            <h1 *ngIf='config.title'>{{config.title}}</h1>
            {{config.message}}
            <p class="warn" *ngIf="config.warningMessage">
                {{config.warningMessage}}
            </p>
            <footer>
                <button *ngIf="config?.actions?.accept" (click)="runMethod('accept')" class="good">
                    {{config?.actions?.accept?.text}}
                </button>
                <button *ngIf="config?.actions?.reject" (click)="runMethod('reject')" class="bad">
                    {{config?.actions?.reject?.text}}
                </button>
                <button *ngIf="config?.actions?.cancel" (click)="runMethod('cancel')">
                    {{config?.actions?.cancel?.text}}
                </button>
            </footer>
        </article>
    `
})
export class UniConfirmContent {
    @Input('config')
    public config: IUniConfirmModalConfig;

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
    public modal: UniModal;

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

    public confirm(title: string, message: string, hasCancel: boolean, titles: string[]): Promise<number> {
        return new Promise((resolve, reject) => {
            let config: IUniConfirmModalConfig = {
                title: title,
                message: message,
                wariningMessage: titles[3],
                actions: {
                    accept: {
                        text: titles[0],
                        method: () => { this.close(); resolve(ConfirmActions.ACCEPT); }
                    },
                    reject: {
                        text: titles[1],
                        method: () => { this.close(); resolve(ConfirmActions.REJECT); }
                    }
                }
            };
            if (hasCancel) {
                config.actions.cancel = {
                    text : titles[2],
                    method: () => { this.close(); resolve(ConfirmActions.CANCEL); }
                };

            }
            this.config = config;
            this.open();
        });
    }
}
