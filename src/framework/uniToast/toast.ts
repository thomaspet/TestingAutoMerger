import {Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy} from '@angular/core';
import {IToast} from './toastService';

@Component({
    selector: 'uni-toast',
    template: `{{toast.message}}`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToast {
    @Input()
    private toast: IToast;

    @Output()
    private dismiss: EventEmitter<any> = new EventEmitter();

    @HostListener('click')
    private onClick() {
        this.dismiss.emit(null);
    }

    constructor() {}

    public ngAfterViewInit() {
        if (this.toast && this.toast.duration > 0) {
            setTimeout(() => {
                this.dismiss.emit(null);
            }, (this.toast.duration * 1000));
        }
    }
    
}
