import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, QueryList,
    ViewChildren
} from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UniField2 } from '@uni-framework/ui/uniform2/uni-field/uni-field.component';
import { UniFieldset2 } from '@uni-framework/ui/uniform2/uni-fieldset/uni-fieldset.component';

@Component({
    selector: 'uni-section',
    templateUrl: 'uni-section.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniSection2 {
    @Input() controls: FormGroup;
    @Input() fields: any;
    @Input() header: string;

    @Output() focusEvent: EventEmitter<any> = new EventEmitter();
    @Output() blurEvent: EventEmitter<any> = new EventEmitter();
    @Output() sourceChange: EventEmitter<any> = new EventEmitter();
    @Output() changeEvent: EventEmitter<any> = new EventEmitter();
    @Output() errorEvent: EventEmitter<any> = new EventEmitter();
    @Output() openSectionEvent: EventEmitter<any> = new EventEmitter();
    @Output() closeSectionEvent: EventEmitter<any> = new EventEmitter();

    @ViewChildren(UniField2, {read: UniField2}) fieldsList: QueryList<UniField2>;
    @ViewChildren(UniFieldset2, {read: UniFieldset2}) fieldsetsList: QueryList<UniFieldset2>;

    isOpen = true;

    constructor() {}


    onFocus(event) {
        this.focusEvent.emit(event);
    }

    onBlur(event) {
        this.blurEvent.emit(event);
    }

    onSourceChange(event) {
        this.sourceChange.emit(event);
    }

    onChange(event) {
        this.changeEvent.emit(event);
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.openSectionEvent.emit({
                id: this.fields.id,
                section: this,
                config: this.fields
            });
        } else {
            this.closeSectionEvent.emit({
                id: this.fields.id,
                section: this,
                config: this.fields,
            });

        }
    }

    open() {
        this.isOpen = true;
        this.openSectionEvent.emit({
            id: this.fields.id,
            section: this,
            config: this.fields
        });
    }

    close() {
        this.isOpen = false;
        this.closeSectionEvent.emit({
            id: this.fields.id,
            section: this,
            config: this.fields,
        });
    }
}
