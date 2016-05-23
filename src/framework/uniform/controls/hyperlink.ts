import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../unifieldlayout';
declare var _; // jquery and lodash

@Component({
    selector: 'uni-hyperlink-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <a [href]="getValue()"
        >{{field?.Options?.description}}</a>
    `
})
export class UniHyperlinkInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniHyperlinkInput> = new EventEmitter<UniHyperlinkInput>(true);
    
    
    constructor() {
    }

    public focus() {
        return this;
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
        this.onReady.emit(this);
    }
}