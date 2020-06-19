import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ToastService, ToastType, IToast} from './toastService';

@Component({
    selector: 'uni-toast-list',
    template: `
        <uni-toast *ngIf="toastService.spinnerToast$ | async as spinnerToast"
            role="alert"
            class="load"
            [toast]="spinnerToast"
            (dismiss)="toastDismissed(spinnerToast)">
        </uni-toast>

        <uni-toast *ngFor="let toast of toastService.toasts$ | async"
            role="alert"
            [toast]="toast"
            (dismiss)="toastDismissed(toast)"
            [ngClass]="{
                'bad' : toast.type === 1,
                'good': toast.type === 2,
                'warn': toast.type === 3,
                'info': toast.type === 4,
                'toast-done': toast.done
            }">
        </uni-toast>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToastList {
    constructor(
        public toastService: ToastService,
        public cdr: ChangeDetectorRef
    ) {}

    public toastDismissed(toast: IToast) {
        toast.done = true;

        setTimeout(() => {
            if (toast.type === ToastType.load) {
                this.toastService.hideLoadIndicator();
            } else {
                this.toastService.removeToast(toast.id);
            }
        }, 300);
    }
}
