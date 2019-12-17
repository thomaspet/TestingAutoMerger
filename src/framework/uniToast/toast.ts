import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener} from '@angular/core';
import {IToast, ToastType} from './toastService';

@Component({
    selector: 'uni-toast',
    templateUrl: './toast.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToast {
    @Input() toast: IToast;
    @Output() dismiss: EventEmitter<any> = new EventEmitter();

    hovering: boolean;
    timedOut: boolean;
    icon: string;

    @HostListener('click') close() {
        this.dismiss.emit(true);
    }

    @HostListener('mouseenter') mouseEnter() {
        this.hovering = true;
    }

    @HostListener('mouseleave') mouseLeave() {
        this.hovering = false;
        if (this.timedOut) {
            this.close();
        }
    }

    ngOnChanges() {
        if (this.toast) {
            switch (this.toast.type) {
                case ToastType.good:
                    this.icon = 'check_circle';
                break;
                case ToastType.warn:
                    this.icon = 'error';
                break;
                case ToastType.bad:
                    this.icon = 'block';
                break;
                default:
                    this.icon = 'info';
                break;
            }
        }
    }

    ngAfterViewInit() {
        if (this.toast && this.toast.duration > 0) {
            setTimeout(() => {
                this.timedOut = true;
                if (!this.hovering) {
                    this.close();
                }
            }, (this.toast.duration * 1000));
        }
    }
}
