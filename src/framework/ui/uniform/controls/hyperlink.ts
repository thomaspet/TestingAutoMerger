import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-hyperlink-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <a #element 
           [href]="getValue()" 
           [attr.target]="field?.Options?.target"
           [attr.aria-describedby]="asideGuid"
           (focus)="focusHandler()"
           [title]="field?.Options?.description"
        >{{field?.Options?.description}}</a>
        <ng-content></ng-content>
    `
})
export class UniHyperlinkInput extends BaseControl {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public control: FormControl;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    @Output() public focusEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    @ViewChild('element') public input: ElementRef;

    constructor() {
        super();
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
