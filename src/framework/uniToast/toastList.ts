import {Component} from '@angular/core';
import {UniToast} from './toast';
import {ToastService} from './toastService';

@Component({
    selector: 'uni-toast-list',
    template: `
        <ol class=toast-list>
            <li *ngFor="let toast of toastService.toasts">
                <uni-toast role="alert"
                           [toast]="toast"
                           (dismiss)="toastDismissed(toast)"
                           [ngClass]="{
                               'bad' : toast.type === 1,
                               'good': toast.type === 2,
                               'warn': toast.type === 3
                           }">
                </uni-toast>
            </li>
        </ol>
    `
})
export class UniToastList {

    constructor(private toastService: ToastService) {}

    private toastDismissed(toast) {
        this.toastService.removeToast(toast.id);
    }
}
