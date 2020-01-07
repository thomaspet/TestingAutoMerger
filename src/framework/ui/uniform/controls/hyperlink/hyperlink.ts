import {
    Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../../interfaces';
import {BaseControl} from '../baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-hyperlink-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './hyperlink.html'
})
export class UniHyperlinkInput extends BaseControl implements OnChanges {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    @Output() public focusEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    @ViewChild('element', { static: true }) public input: ElementRef;

    constructor() {
        super();
    }

    public ngOnChanges() {
        this.createControl();
    }

    public focus() {
        this.input.nativeElement.focus();
        return this;
    }

    public getValue() {
        const value = _.get(this.model, this.field.Property);
        return  value || '#';
    }
}
