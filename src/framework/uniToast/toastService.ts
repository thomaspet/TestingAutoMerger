import {Injectable} from '@angular/core';

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

    public addToast(
        title: string,
        type?: ToastType,
        durationInSeconds?: number,
        message?: string
    ): number {
        const duplicate = this.toasts.find(toast => toast.message === message);
        if (duplicate) {
            const i = this.toasts.indexOf(duplicate);
            this.toasts[i] = <IToast>{
                id: duplicate.id,
                type: duplicate.type,
                title: duplicate.title,
                message: duplicate.message,
                duration: duplicate.duration,
                count: duplicate.count + 1
            };
            return duplicate.id;
        } else {
            const id = this.nextId++;
            this.toasts.push(<IToast>{
                id: id,
                type: type || ToastType.bad,
                title: title,
                message: message || '',
                duration: durationInSeconds || 0,
                count: 1
            });
            return id;
        }
    }

    public clear() {
        this.toasts = [];
    }

    public getToasts(): IToast[] {
        return this.toasts;
    }

    public removeToast(id: number) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });
    }
}
