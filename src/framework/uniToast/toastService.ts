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

    public removeToast(id) {
        this.toasts = this.toasts.filter((toast) => {
            return toast.id !== id;
        });
    }

}
