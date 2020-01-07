import {
    Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectionStrategy, SimpleChanges,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';


@Component({
    selector: 'uni-static-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './static-text.html'
})
export class UniStaticTextInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniStaticTextInput> = new EventEmitter<UniStaticTextInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniStaticTextInput> = new EventEmitter<UniStaticTextInput>(true);


    @ViewChild('input', { static: true }) private inputElement: ElementRef;

    constructor() {
        super();
    }

    public focus() {
        const input: HTMLInputElement = this.inputElement.nativeElement;
        if (input) {
            input.focus();
        }
    }

    public ngOnChanges() {
        this.createControl();
    }
}
