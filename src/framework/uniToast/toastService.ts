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
}

@Injectable()
export class ToastService {
    private nextId: number = 0;
    private toasts: IToast[] = [];

    public addToast(title: string, type?: ToastType, durationInSeconds?: number, message?: string): number {
        let id = this.nextId++;
        this.toasts.push({
            id: id,
            type: type || ToastType.bad,
            title: title,
            message: message || '',
            duration: durationInSeconds || 0,
        });
        return id;
    }

    public clear() {
        this.toasts.forEach( x => {
            this.removeToast(x.id);
        });
        this.toasts.length = 0;
    }

    public removeToast(id) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });
    }

    public parseErrorMessageFromError(err): string {
        let message = '';

        if (err && err._body) {
            let errContent = JSON.parse(err._body);
            if (errContent && errContent.Messages && errContent.Messages.length > 0) {
                errContent.Messages.forEach(msg => {
                    message += msg.Message + '.\n';
                });
            }
        } else if (err && err._body) {
            message = JSON.stringify(err._body);
        }

        return message;
    }
}
