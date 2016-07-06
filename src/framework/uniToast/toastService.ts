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
    
    public addToast(title: string, type?: ToastType, duration?: number, message?: string) {
        this.toasts.push({
            id: this.nextId++,
            type: type || ToastType.bad,
            title: title,
            message: message || '',
            duration: duration || 0,
        });
    }

    public removeToast(id) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });
    }

}
