import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';

export enum ToastType {
    bad = 1,
    good = 2,
    warn = 3,
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

    constructor() {
        this.toasts$ = new ReplaySubject<IToast[]>(1);
    }

    public addToast(
        title: string,
        type?: ToastType,
        durationInSeconds?: number,
        message?: string
    ): number {
        let toastID: number;
        const duplicate = this.toasts.find((toast) => {
            return toast.title === title
                && toast.message === (message || '');
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
                message: message || '',
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
