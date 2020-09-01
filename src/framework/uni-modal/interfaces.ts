import { EventEmitter } from '@angular/core';
import {Observable} from 'rxjs';

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
    icon?: string;
    list?: any[];
    listkey?: string;
    listMessage?: string;
    buttonLabels?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    buttonIcons?: {
        accept?: string;
        reject?: string;
        cancel?: string;
    };
    cancelValue?: any;
    modalConfig?: any;
    activateClickOutside?: boolean; // removeMe?
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    hideCloseButton?: boolean;
    fieldType?: number;
    fieldLabel?: string;
}

export interface IUniModal {
    onClose: EventEmitter<any>;
    options?: IModalOptions;

    /**
     * Called by modalService when force-closing a dialog (clickOutside, escape, close icon).
     * Allows you to resolve a value for the onClose emit in these cases.
    */
    forceCloseValueResolver?: () => any;

    /**
     * Called by modalService before force-closing a dialog (clickOutside, escape, close icon).
     * Allows you to specify if the closing is allowed to happen
    */
    canDeactivate?: () => boolean | Observable<boolean>;
}
