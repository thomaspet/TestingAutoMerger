import {Injectable} from '@angular/core';

export enum ToastType {
    bad = 1,
    good = 2,
    warn = 3,
}

export interface IToast {
    id: number;
    type: ToastType;
    message: string;
    duration: number;
}

@Injectable()
export class ToastService {
    private nextId: number = 0;
    private toasts: IToast[] = [];
    
    public addToast(message: string, type: ToastType = ToastType.bad, duration: number = 0) {
        this.toasts.push({
            id: this.nextId++,
            type: type,
            message: message,
            duration: duration,
        });
    }

    public removeToast(id) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });
    }

}
