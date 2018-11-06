import {
    ChangeDetectionStrategy, Component, EventEmitter, Input, Output, QueryList,
    ViewChildren
} from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UniField2 } from '@uni-framework/ui/uniform2/uni-field/uni-field.component';

@Component({
    selector: 'uni-fieldset',
    templateUrl: 'uni-fieldset.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniFieldset2 {
    @Input() controls: FormGroup;
    @Input() fields: any;
    @Input() legend: string;

    @Output() focusEvent: EventEmitter<any> = new EventEmitter();
    @Output() blurEvent: EventEmitter<any> = new EventEmitter();
    @Output() sourceChange: EventEmitter<any> = new EventEmitter();
    @Output() changeEvent: EventEmitter<any> = new EventEmitter();
    @Output() errorEvent: EventEmitter<any> = new EventEmitter();

    @ViewChildren(UniField2, {read: UniField2}) fieldsList: QueryList<UniField2>;

    fieldsetColumns: UniField2[][];

    constructor() {}

    ngOnChanges(changes) {
        if (changes['fields'] && this.fields) {
            this.groupFieldsInColumns();
        }
    }

    private groupFieldsInColumns() {
        const fieldsetColumns = this.fields.reduce((columns, field) => {
            const columnIndex = field.FieldSetColumn || 0;
            if (!columns[columnIndex]) {
                columns[columnIndex] = [];
            }

            columns[columnIndex].push(field);
            return columns;
        }, []);

        this.fieldsetColumns = fieldsetColumns.filter(col => col && col.length > 0);
    }

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
}
