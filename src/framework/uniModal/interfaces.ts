import { EventEmitter } from '@angular/core';

export enum ConfirmActions {
    ACCEPT,
    REJECT,
    CANCEL
}

export interface IModalOptions {
    data?: any;
    class?: string;
    header?: string;
    message?: string;
    warning?: string;
    list?: any[];
    listkey?: string;
    listMessage?: string;
    buttonLabels?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    cancelValue?: any;
    modalConfig?: any;
    activateClickOutside?: boolean; // removeMe?
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
}

export interface IUniModal {
    onClose: EventEmitter<any>;
    options?: IModalOptions;
}
