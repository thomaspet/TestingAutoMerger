import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, EventEmitter, Input, Output, QueryList, SimpleChange, SimpleChanges, ViewChildren
} from '@angular/core';
import {
    ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR,
    Validators
} from '@angular/forms';
import * as _ from 'lodash';
import {
    getControlIDFromProperty, getPropertyFromControlID,
    validateEmailControl
} from '@uni-framework/ui/uniform2/unform2.helpers';
import { UniField2 } from '@uni-framework/ui/uniform2/uni-field/uni-field.component';
import { UniFieldset2 } from '@uni-framework/ui/uniform2/uni-fieldset/uni-fieldset.component';
import { UniSection2 } from '@uni-framework/ui/uniform2/uni-section/uni-section.component';
import { errorHandler } from '@uni-framework/ui/uniform2/uniform2/uniform2-errors-manager';

@Component({
    selector: 'uniform2',
    templateUrl: './uniform2.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: Uniform2Component, multi: true },
    ]
})
export class Uniform2Component implements ControlValueAccessor {
    @Input() fields;

    @Output() focusEvent: EventEmitter<any> = new EventEmitter();
    @Output() blurEvent: EventEmitter<any> = new EventEmitter();
    @Output() sourceChange: EventEmitter<any> = new EventEmitter();
    @Output() updateEvent: EventEmitter<SimpleChanges> = new EventEmitter();
    @Output() errorEvent: EventEmitter<any> = new EventEmitter();
    @Output() warningEvent: EventEmitter<any> = new EventEmitter();
    @Output() openSectionEvent: EventEmitter<any> = new EventEmitter();
    @Output() closeSectionEvent: EventEmitter<any> = new EventEmitter();
    @Output() enterOnFormEvent: EventEmitter<any> = new EventEmitter();

    @ViewChildren(UniField2, {read: UniField2}) fieldsList: QueryList<UniField2>;
    @ViewChildren(UniFieldset2, {read: UniFieldset2}) fieldsetsList: QueryList<UniFieldset2>;
    @ViewChildren(UniSection2, {read: UniSection2}) sectionsList: QueryList<UniSection2>;

    private onChangeCallback: (value: any) => void;
    private onTouchedCallback: () => void;

    group: FormGroup = null;
    model: any = {};
    status: string[] = [];
    currentComponent = null;

    public updatingModel = false;
    public keyDownEvent = new EventEmitter();

    constructor(private changeDetector: ChangeDetectorRef) {}


    ngOnChanges() {
        if (this.fields) {
            this.group = this.createFormGroup(this.fields, this.model);
            this.changeDetector.detectChanges();
            this.group.statusChanges.subscribe(errorHandler(this));
        }
    }

    writeValue(value: any): void {
        this.model = value;
        const tmp = _.cloneDeep(value);
        if (this.group && this.fields && this.model !== null) {
            this.updatingModel = true;
            this.fields.forEach(field => {
                const c = this.group.get(getControlIDFromProperty(field.Property));
                c.setValue(_.get(tmp, field.Property));
            });
            this.updatingModel = false;
        }
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    createFormGroup(fields, model): FormGroup {
        const controls = {};

        fields.forEach(field => {
            const initialValue = _.get(model, field.Property);
            let validators = field.Validators || [];
            if (field.FieldType === 'email') {
                validators = [validateEmailControl(field), ...validators];
            }
            if (field.Required) {
                validators = [Validators.required, ...validators];
            }
            const syncValidators = validators ? Validators.compose(validators) : null;
            const asyncValidators = field.AsyncValidators ? Validators.composeAsync(field.AsyncValidators) : null;
            const id = getControlIDFromProperty(field.Property);
            controls[id] = new FormControl(
                initialValue,
                {
                    validators: syncValidators,
                    asyncValidators: asyncValidators,
                    updateOn: field.UpdateOn || 'blur'
                });
        });

        return new FormGroup(controls);
    }

    onChange(value: any) {
        const changes = {};
        let hasChanges = false;
        _.each(this.group.controls, (control: FormControl, key: string) => {
            const property = getPropertyFromControlID(key);
            const prevValue = _.get(this.model, property);
            if (prevValue !== control.value) {
                changes[property] = new SimpleChange(prevValue, control.value, !control.touched);
                hasChanges = true;
            }
            _.set(this.model, property, control.value);
        });
        if (!this.updatingModel && hasChanges) {
            this.updateEvent.emit(changes);
            this.onChangeCallback(this.model);
        }
    }

    onBlur($event) {
        this.onTouchedCallback();
        this.blurEvent.emit($event);
    }

    onFocus($event) {
        if (this.currentComponent === null) {
            this.enterOnFormEvent.emit($event);
        }
        this.currentComponent = $event;
        this.focusEvent.emit($event);
    }

    onSourceChange($event) {
        this.sourceChange.emit($event);
    }

    onCloseSection($event) {
        this.closeSectionEvent.emit($event);
    }

    onOpenSection($event) {
        this.openSectionEvent.emit($event);
    }

    onKeydown(event: KeyboardEvent) {
        this.keyDownEvent.emit(event);
    }

    checkErrors(fields, group: FormGroup) {
        let errors = {};
        let hasErrors = false;
        fields.forEach(field => {
            const fieldID = getControlIDFromProperty(field.Property);
            const control = group.get(fieldID);
            if (control.invalid) {
                hasErrors = true;
                const concreteErrors = {};
                concreteErrors[field.Property] = control.errors;
                errors = _.assign(errors, concreteErrors);
            }
        });
        return hasErrors ? errors : null;
    }
}
