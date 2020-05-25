import {Injectable, SecurityContext} from '@angular/core';
import {ReplaySubject, Subject, BehaviorSubject} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';

export enum ToastType {
    bad = 1,
    good = 2,
    warn = 3,
    info = 4,
    load = 5,
}

export enum ToastTime {
    short = 5,
    medium = 10,
    long = 15,
    forever = 0
}

export interface IToastAction {
    label: string;
    click: () => void;
    displayInHeader?: boolean;
}

export interface IToastOptions {
    title: string;
    message?: string;
    duration?: number;
    type?: ToastType;
    action?: IToastAction;
}

export interface IToast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration: number;
    count: number;
    action?: IToastAction;
    done?: boolean;
}

export interface SpinnerToast {
    title: string;
    message?: string;
}

@Injectable()
export class ToastService {
    private nextId: number = 0;

    spinnerToast$ = new BehaviorSubject<IToast>(null);
    toasts$ = new BehaviorSubject<IToast[]>([]);

    constructor(private domSanitizer: DomSanitizer) {}

    toast(options: IToastOptions) {
        this.addToast(
            options.title,
            options.type || ToastType.warn,
            options.duration || 0,
            options.message,
            options.action,
        );
    }

    addToast(
        title: string,
        type?: ToastType,
        durationInSeconds?: number,
        message?: string,
        action?: IToastAction,
    ): number {
        let toastID: number;
        const sanitizedMessage = this.domSanitizer.sanitize(SecurityContext.HTML, message);

        const toasts = this.toasts$.value || [];
        const duplicate = toasts.find((toast) => {
            return toast.title === title
                && toast.message === (sanitizedMessage || '');
        });

        if (duplicate) {
            toastID = duplicate.id;
            const i = toasts.indexOf(duplicate);
            toasts[i] = <IToast>{
                id: duplicate.id,
                type: duplicate.type,
                title: duplicate.title,
                message: duplicate.message,
                duration: duplicate.duration,
                count: duplicate.count + 1,
                action: action,
            };
        } else {
            toastID = this.nextId++;
            toasts.push(<IToast>{
                id: toastID,
                type: type || ToastType.warn,
                title: title,
                message: sanitizedMessage || '',
                duration: durationInSeconds || 0,
                count: 1,
                action: action,
            });
        }

        this.toasts$.next(toasts);
        return toastID;
    }

    clear() {
        this.toasts$.next([]);
    }

    getToasts(): IToast[] {
        return this.toasts$.value;
    }

    removeToast(id: number) {
        const toasts = this.toasts$.value || [];
        this.toasts$.next(toasts.filter(toast => toast.id !== id));
    }

    showLoadIndicator(args: { title: string, message?: string }) {
        const toast: IToast = {
            type: ToastType.load,
            title: args.title,
            message: args.message,
            duration: 0,
            count: 1,
            id: this.nextId++
        };

        this.spinnerToast$.next(toast);
    }

    hideLoadIndicator() {
        this.spinnerToast$.next(undefined);
    }
}
