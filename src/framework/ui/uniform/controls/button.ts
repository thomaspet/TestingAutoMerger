import {
    Component, ViewChild, Input, Output, Renderer, ElementRef,
    EventEmitter, ChangeDetectionStrategy, SimpleChanges
} from '@angular/core';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as _ from 'lodash';

@Component({
    selector: 'uni-button-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button #button
            [attr.aria-describedby]="asideGuid"
            [class]="field?.Options?.class"
            [disabled]="field?.ReadOnly"
            (click)="clickHandler($event)"
            (focus)="focusHandler($event)"
            type="button" 
            [title]="field?.Label"
        >{{field?.Label}}</button>
        <ng-content></ng-content>
    `
})
export class UniButtonInput extends BaseControl {
    @ViewChild('button') private buttonElement: ElementRef;

    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public asideGuid: string;

    @Output() public readyEvent: EventEmitter<UniButtonInput> = new EventEmitter<UniButtonInput>(true);
    @Output() public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    @Output() public focusEvent: EventEmitter<UniButtonInput> = new EventEmitter<UniButtonInput>(true);

    constructor() {
        super();
    }

    public focus() {
        this.buttonElement.nativeElement.focus();
    }

    private clickHandler(event) {
        this.field.Options.click(event);
    }
}
