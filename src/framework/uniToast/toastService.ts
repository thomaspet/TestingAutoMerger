import {Injectable, SecurityContext} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {DomSanitizer} from '@angular/platform-browser';

export enum ToastType {
    bad = 1,
    good = 2,
    warn = 3,
}

export enum ToastTime {
    short = 5,
    medium = 10,
    long = 15,
    forever = 0
}

export interface IToast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
    duration: number;
    count: number;
}

@Injectable()
export class ToastService {
    private nextId: number = 0;
    private toasts: IToast[] = [];

    public toasts$: ReplaySubject<IToast[]>;

    constructor(private domSanitizer: DomSanitizer) {
        this.toasts$ = new ReplaySubject<IToast[]>(1);
    }

    public addToast(
        title: string,
        type?: ToastType,
        durationInSeconds?: number,
        message?: string
    ): number {
        let toastID: number;
        const sanitizedMessage = this.domSanitizer.sanitize(SecurityContext.HTML, message);
        const duplicate = this.toasts.find((toast) => {
            return toast.title === title
                && toast.message === (sanitizedMessage || '');
        });


        if (duplicate) {
            toastID = duplicate.id;
            const i = this.toasts.indexOf(duplicate);
            this.toasts[i] = <IToast>{
                id: duplicate.id,
                type: duplicate.type,
                title: duplicate.title,
                message: duplicate.message,
                duration: duplicate.duration,
                count: duplicate.count + 1
            };
        } else {
            toastID = this.nextId++;
            this.toasts.push(<IToast>{
                id: toastID,
                type: type || ToastType.bad,
                title: title,
                message: sanitizedMessage || '',
                duration: durationInSeconds || 0,
                count: 1
            });
        }

        this.toasts$.next(this.toasts);
        return toastID;
    }

    public clear() {
        this.toasts = [];
        this.toasts$.next(this.toasts);
    }

    public getToasts(): IToast[] {
        return this.toasts;
    }

    public removeToast(id: number) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });

        this.toasts$.next(this.toasts);
    }
}
