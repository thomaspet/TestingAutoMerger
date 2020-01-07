import {
    Component, ViewChild, Input, Output, ElementRef,
    EventEmitter, ChangeDetectionStrategy, SimpleChanges, OnInit
} from '@angular/core';
import {BaseControl} from '../baseControl';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces/index';

@Component({
    selector: 'uni-button-input',
    templateUrl: './button.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniButtonInput extends BaseControl implements OnInit {
    @ViewChild('button', { static: true }) private buttonElement: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniButtonInput> = new EventEmitter<UniButtonInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniButtonInput> = new EventEmitter<UniButtonInput>(true);

    constructor() {
        super();
    }

    public ngOnInit() {
        this.createControl();
    }

    public focus() {
        this.buttonElement.nativeElement.focus();
    }

    public clickHandler(event) {
        this.field.Options.click(event);
    }
}
