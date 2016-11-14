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
    warningMessage?: string;
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
            <p class="warn" *ngIf="config.warningMessage">{{config.warningMessage}}</p>
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
    template: `<uni-modal [type]="type" [config]="config" (close)="onClose()" ></uni-modal>`
})
export class UniConfirmModal {

    public type: any = UniConfirmContent;

    @ViewChild(UniModal)
    public modal: UniModal;

    @Input()
    public config: any;

    constructor() {
        this.initDefaultConfig();
    }

    public open() {
        this.modal.open();
    }

    public close() {
        this.modal.close();
    }

    public content() {
        this.modal.getContent();
    }

    private onClose: () => void = () => {};

    private initDefaultConfig() {
        this.config = { 
            title: 'Confirm',
            message: 'Please confirm',
            warningMessage: '',
            actions: {
                accept: {
                    text: 'Yes',
                    method: () => { this.close(); }
                },
                reject: {
                    text: 'No',
                    method: () => { this.close(); }
                }
            }
        };
    }

    public confirm(message: string, title?: string, hasCancel = false, titles?: { accept?: string, reject?: string, cancel?: string, warning?: string }): Promise<number> {
        return new Promise((resolve, reject) => {

            var cfg = this.config;
            cfg.title = title || 'Vennligst bekreft';
            cfg.message = message;
            cfg.warningMessage = titles && titles.warning ? titles.warning : undefined;
            
            cfg.actions.accept = {
                text: (titles && titles.accept ? titles.accept : '') || 'Ja',
                method: () => { resolve(ConfirmActions.ACCEPT); this.close(); }
            };
            cfg.actions.reject = {
                text: titles && titles.reject ? titles.reject : '' || 'Nei',
                method: () => { resolve(ConfirmActions.REJECT); this.close(); }
            };
            if (hasCancel) {
                cfg.actions.cancel = {
                    text: titles && titles.cancel ? titles.cancel : '' || 'Avbryt',
                    method: () => { resolve(ConfirmActions.CANCEL); this.close(); }
                };

            }
            this.onClose = () => {
                resolve(ConfirmActions.REJECT);
            };
            this.open();
        });
    }
}
