import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener} from '@angular/core';
import {IToast} from './toastService';
import {UniTranslationService} from '@app/services/services';

@Component({
    selector: 'uni-toast',
    template: `
        <i class="material-icons toast-close-icon"
            (click)="close()"
            role="button"
            aria-label="Close">
            close
        </i>

        <header>
            <i class="material-icons toast-type-icon">
                {{ (toast.type === 1) ? 'error_outline' : (toast.type === 2) ? 'check_circle_outline' : 'warning' }}
            </i>
            <span>
                {{toast.title | translate}}
                <small class="toast-count" *ngIf="toast.count > 1">({{toast.count}})</small>
            </span>
            <span class="toast-action"
                *ngIf="toast.action && toast.action.displayInHeader"
                (click)="toast.action.click()">
                {{toast.action.label}}
            </span>
        </header>

        <section class="toast-message"
            *ngIf="toast.message?.length"
            [innerHTML]="toast.message | translate">
        </section>

        <span class="toast-action" role="button"
            *ngIf="toast.action && !toast.action.displayInHeader"
            (click)="toast.action.click()">
            {{toast.action.label}}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToast {
    @Input() toast: IToast;
    @Output() dismiss: EventEmitter<any> = new EventEmitter();

    hovering: boolean;
    timedOut: boolean;

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
