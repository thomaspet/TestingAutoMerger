import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {ToastService, IToast} from './toastService';

@Component({
    selector: 'uni-toast-list',
    template: `
        <ul class="toast-list centered" *ngIf="centeredToasts?.length">
            <li *ngFor="let toast of centeredToasts">
                <uni-toast
                    role="alert"
                    [toast]="toast"
                    (dismiss)="toastDismissed(toast)"
                    [ngClass]="{
                        'bad' : toast.type === 1,
                        'good': toast.type === 2,
                        'warn': toast.type === 3
                    }">
                </uni-toast>
            </li>
        </ul>

        <!--ul class="toast-list" *ngIf="rightAlignedToasts?.length">
            <li *ngFor="let toast of rightAlignedToasts">
                <uni-toast
                    role="alert"
                    [toast]="toast"
                    (dismiss)="toastDismissed(toast)"
                    [ngClass]="{
                        'bad' : toast.type === 1,
                        'good': toast.type === 2,
                        'warn': toast.type === 3,
                        'toast-done': toast.done
                    }">
                </uni-toast>
            </li>
        </ul-->
        <div class="toast-list" *ngIf="rightAlignedToasts?.length">
            <uni-toast *ngFor="let toast of rightAlignedToasts" id="toast.title"
                role="alert"
                [toast]="toast"
                (dismiss)="toastDismissed(toast)"
                [ngClass]="{
                    'bad' : toast.type === 1,
                    'good': toast.type === 2,
                    'warn': toast.type === 3,
                    'toast-done': toast.done
                }">
            </uni-toast>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToastList {
    centeredToasts: IToast[];
    rightAlignedToasts: IToast[];

    constructor(
        public toastService: ToastService,
        public cdr: ChangeDetectorRef
    ) {}

    ngAfterViewInit() {
        this.toastService.toasts$.subscribe(toasts => {
            if (toasts && toasts.length) {
                this.centeredToasts = toasts.filter(toast => toast.centered);
                this.rightAlignedToasts = toasts.filter(toast => !toast.centered);

            } else {
                this.centeredToasts = this.rightAlignedToasts = [];
            }

            this.cdr.markForCheck();
        });
    }

    public toastDismissed(toast) {
        toast.done = true;

        setTimeout(() => {
            this.toastService.removeToast(toast.id);
        }, 1000);
    }
}
