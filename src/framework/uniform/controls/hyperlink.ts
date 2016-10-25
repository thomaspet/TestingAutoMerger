import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-hyperlink-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <a [href]="getValue()" [attr.target]="field?.Options?.target" (focus)="focusHandler()"
        >{{field?.Options?.description}}</a>
    `
})
export class UniHyperlinkInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);

    @Output()
    public focusEvent: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    
    constructor() {
    }

    public focus() {
        return this;
    }

    public focusHandler() {
        this.focusEvent.emit(this);
    }

    public readMode() {
        return this;
    }

    public editMode() {
        return this;
    }

    public getValue() {
        return _.get(this.model, this.field.Property) || '#';
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
    }
}
