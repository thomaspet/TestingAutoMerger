import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {IToast} from './toastService';

@Component({
    selector: 'uni-toast',
    template: `
        <header>{{toast.title}}</header>
        <small *ngIf="toast.message.length">{{toast.message}}</small>
        <button aria-label="Close" (click)="close()"></button>
    `,
    host: {
        '(click)': 'close()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToast {
    @Input()
    private toast: IToast;

    @Output()
    private dismiss: EventEmitter<any> = new EventEmitter();

    public ngAfterViewInit() {
        if (this.toast && this.toast.duration > 0) {
            setTimeout(() => {
                this.close();
            }, (this.toast.duration * 1000));
        }
    }

    private close() {
        this.dismiss.emit(true);
    }
}
