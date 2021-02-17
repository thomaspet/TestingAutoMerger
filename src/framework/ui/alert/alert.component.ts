import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'uni-alert-component',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniAlertComponent {
    @Input() title: string;
    @Input() text: string;
    @Input() type: string;
    @Input() icon: string;
    @Input() isOpen: boolean;
    @Output() close = new EventEmitter<boolean>(true);
    constructor(private changeDetector: ChangeDetectorRef) {

    }

    hide() {
        this.isOpen = false;
        this.close.emit(true);
        this.changeDetector.detectChanges();
    }
}
