import {
    Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener,
    ChangeDetectionStrategy, ElementRef, HostBinding
} from '@angular/core';
import * as _ from 'lodash';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import { Observable, fromEvent, Subject } from 'rxjs';
import {UniFormError} from '@uni-framework/ui/uniform/interfaces/uni-form-error.interface';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces/uni-field-layout.interface';
import {FieldType} from '../field-type.enum';
import { BaseControl } from '../controls/baseControl';
import {take} from 'rxjs/operators';

@Component({
    selector: 'uni-field',
    templateUrl: './unifield.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniField {
    @Input() public field: UniFieldLayout;
    @Input() public model: any;
    @Input() public formConfig: any;

    @Output() public readyEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);
    @Output() public changeEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() public inputEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() public focusEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);
    @Output() public moveForwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public errorEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @HostBinding('class') cssClasses = '';
    @ViewChild('selectedComponent') public component: any;

    public classes: (string | Function)[] = [];
    public asideGuid: string = 'unifield-' + performance.now();
    public touched = false;
    public errorMessages = [];
    public componentResolver: any;

    labelWidth: string;
    hasError = false;
    hasWarning = false;

    private componentDestroyed$: Subject<any> = new Subject();

    public get Component() {
        return new Promise(resolve => {
            if (this.component) {
                resolve(this.component);
                return;
            }
            this.componentResolver = resolve;
        });
    }

    @HostBinding('hidden')
    public get Hidden() { return this.field.Hidden; }

    public set Hidden(value: boolean) {
        this.field.Hidden = value;
        this.ref.markForCheck();
    }

    constructor(public ref: ChangeDetectorRef, public elementRef: ElementRef) {
        this.readyEvent.subscribe(() => {
            const input: HTMLInputElement = this.elementRef.nativeElement.querySelector('input');
            if (input) {
                fromEvent(input, 'focus')
                    .takeUntil(this.componentDestroyed$)
                    .subscribe(event => this.eventHandler(event.type, event));

                fromEvent(input, 'blur')
                    .takeUntil(this.componentDestroyed$)
                    .subscribe(event => this.eventHandler(event.type, event));
            }
        });
    }

    ngOnChanges() {
        if (this.field && this.field.Classes) {
            this.cssClasses = this.buildClassString();
        }

        if (this.formConfig && this.formConfig.labelWidth) {
            this.labelWidth = this.formConfig.labelWidth;
        }

        if (this.field && this.field.LabelWidth) {
            this.labelWidth = this.field.LabelWidth;
        }
    }

    public ngOnDestroy() {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
        try {
            // Complete readonly subject from here.
            // Because if the control has a onDestroy hook then the one in BaseControl wont run..
            (<BaseControl> this.component).readOnly$.complete();
        } catch (e) {}
    }

    public onFocusHandler(event) {
        this.touched = true;
        this.focusEvent.emit(this);
    }

    public focus() {
        if (this.component) {
            this.component.focus();
        } else { // try twice
            setTimeout(() => {
                if (this.component) {
                    this.component.focus();
                }
            }, 200);
        }
    }

    public readMode() {
        // need markforcheck
        if (this.component) {
            this.component.readMode();
            this.ref.markForCheck();
        }
    }

    public editMode() {
        // need markforcheck
        if (this.component) {
            this.component.editMode();
            this.ref.markForCheck();
        }
        // this.Component.then((cmp: any) => cmp.editMode());
    }

    public onReadyHandler() {
        if (this.componentResolver) {
            this.componentResolver(this.component);
        }
        this.readyEvent.emit(this);
    }

    public validate(value, field, validators) {
        const errors: Observable<UniFormError>[] = [];
        if (!validators) {
            return errors;
        }
        validators.forEach(validator => {
            const error: UniFormError | Observable<UniFormError> = validator(value, field);
            errors.push(
                error instanceof Observable ? error : Observable.of(error)
            );
        });
        return errors;
    }

    public validateModel(value) {
        let errorMessages = [];
        if (this.field.Required) {
            if (_.isNil(value) || value === '') {
                const error: Observable<UniFormError> = Observable.of({
                    errorMessage: 'Field \'' + this.field.Label + '\' is required',
                    value: value,
                    field: this.field,
                    isWarning: false
                });
                errorMessages.push(error);
            }
        }
        const validationResult = this.validate(value, this.field, this.field.Validations);
        if (validationResult.length !== 0) {
            errorMessages = errorMessages.concat(validationResult);
        }

        const errorsList = {};
        errorsList[this.field.Property] = [];
        this.hasWarning = false;
        this.hasError = false;
        this.errorMessages = [];
        const numErrors = errorMessages.length;
        let i = 0;
        if (this.formConfig.hideErrors !== true) {
            errorMessages.forEach((errorMessage: Observable<UniFormError>) => {
                errorMessage.pipe(take(1)).subscribe(error => {
                    i++;
                    if (!error) {
                        if (i === numErrors) {
                            errorsList[this.field.Property] = this.errorMessages;
                            this.errorEvent.emit(errorsList);
                        }

                        this.cssClasses = this.buildClassString();
                        return;
                    }
                    if (error.isWarning) {
                        this.hasWarning = true;
                    } else {
                        this.hasError = true;
                    }
                    this.errorMessages = [error];
                    if (i === numErrors) {
                        errorsList[this.field.Property] = this.errorMessages;
                        this.errorEvent.emit(errorsList);
                    }

                    this.cssClasses = this.buildClassString();
                });
            });
        }
    }

    public onChangeHandler(model: SimpleChange) {
        const keys = Object.keys(model);
        const value = model[keys[0]].currentValue;
        this.validateModel(value);
        this.changeEvent.emit(model);
    }

    public onInputHandler(model) {
        this.inputEvent.emit(model);
    }

    public buildClassString() {
        let classes = '';
        if (this.field.Classes) {
            classes += this.field.Classes;
        }

        if (this.hasWarning) {
            classes += ' warn';
        }

        if (this.hasError) {
            classes += ' error';
        }

        return classes;
    }

    public isInput(type) {
        return type !== FieldType.BUTTON;
    }

    /**********
     *
     *  EVENT HANDLERS
     *
     */
    public onMultivalueMoveForward(action) {
        if (!this.field.isLast && action.event) {
            action.event.preventDefault();
            action.event.stopPropagation();
        }
        this.moveForwardEvent.emit(action);
    }

    @HostListener('keydown', ['$event'])
    public keyDownHandler(event: KeyboardEvent) {
        const key: string = KeyCodes[event.which || event.keyCode];
        const ctrl: boolean = event.ctrlKey;
        const shift: boolean = event.shiftKey;
        const combination: string[] = [];

        if (ctrl) {
            combination.push('ctrl');
        }
        if (shift) {
            combination.push('shift');
        }
        if (key) {
            if (combination.indexOf(key.toLowerCase()) < 0) {
                combination.push(key.toLowerCase());
            }
        }
        if (combination.length > 0) {
            const methodName = combination.join('_');
            if (this.eventHandler(methodName, event)) {
                return;
            }
        }

        if (combination.length === 1 && (combination[0] === 'enter')) {
            this.moveForwardEvent.emit({
                event: event,
                field: this.field
            });
        }

        return;
    }

    public eventHandler(eventName, event) {
        if (this.field.Options && this.field.Options.events) {
            const method = <any>this.field.Options.events[eventName];
            if (method) {
                event.stopPropagation();
                event.preventDefault();
                method(this.model);
                return true;
            }
        }
        return false;
    }

    public getSimpleChange() {
        const prop = this.field.Property;
        const simplechange = {};
        simplechange[prop] = new SimpleChange(null, this.getModelValue(), false);
        return simplechange;
    }

    public getModelValue() {
        return _.get(this.model, this.field.Property);
    }
}
