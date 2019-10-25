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
    checkboxLabel?: string;
    footerCls?: string;
    warning?: string;
    list?: any[];
    listkey?: string;
    listMessage?: string;
    buttonLabels?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    buttonClasses?: {
        accept?: string;
        reject?: string;
    };
    cancelValue?: any;
    modalConfig?: any;
    activateClickOutside?: boolean; // removeMe?
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    hideCloseButton?: boolean;
}

export interface IUniModal {
    onClose: EventEmitter<any>;
    options?: IModalOptions;

    /**
        Called by modalService when force-closing a dialog (clickOutside, escape, close icon)

        Allows you to resolve a value for the onClose emit in these cases.
    */
    forceCloseValueResolver?: () => any;
}
