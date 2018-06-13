import {
    Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener,
    ChangeDetectionStrategy, ElementRef, HostBinding
} from '@angular/core';
import * as _ from 'lodash';
import {KeyCodes} from '../../../../app/services/common/keyCodes';
import { Observable } from 'rxjs';
import {UniFormError} from '@uni-framework/ui/uniform/interfaces/uni-form-error.interface';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces/uni-field-layout.interface';

@Component({
    selector: 'uni-field',
    templateUrl: './unifield.html',
    host: {'[class]' : 'buildClassString()'},
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
    @Output() public moveBackwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public errorEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @HostBinding('class.error') public hasError = 0;
    @HostBinding('class.warn') public hasWarning = 0;
    @ViewChild('selectedComponent') public component: any;

    public classes: (string | Function)[] = [];
    public asideGuid: string = 'unifield-' + performance.now();
    public touched = false;
    public errorMessages = [];
    public componentResolver: any;
    public keyDownSubscription;
    public elementReference;
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
            const input = this.elementRef.nativeElement.querySelector('input');
            if (input) {
                input.addEventListener('blur', event => this.eventHandler(event.type, event));
                input.addEventListener('focus', event => this.eventHandler(event.type, event));
            }
        });
    }

    public ngOnDestroy() {
        if (this.keyDownSubscription) {
            this.keyDownSubscription.unsubscribe();
        }
    }

    public ngOnChanges() {
        if (this.elementReference !== this.elementRef) {
            if (this.keyDownSubscription) {
                this.keyDownSubscription.unsubscribe();
            }
            this.keyDownSubscription = Observable.fromEvent(this.elementRef.nativeElement, 'keydown')
                .subscribe(this.keyDownHandler.bind(this));
            this.elementReference = this.elementRef;
        }
    }

    public onFocusHandler(event) {
        this.touched = true;
        this.focusEvent.emit(event);
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
        this.hasWarning = 0;
        this.hasError = 0;
        this.errorMessages = [];
        const numErrors = errorMessages.length;
        let i = 0;
        if (this.formConfig.hideErrors !== true) {
            errorMessages.forEach((errorMessage: Observable<UniFormError>) => {
                errorMessage.subscribe(error => {
                    i++;
                    if (!error) {
                        if (i === numErrors) {
                            errorsList[this.field.Property] = this.errorMessages;
                            this.errorEvent.emit(errorsList);
                        }
                        return;
                    }
                    if (error.isWarning) {
                        this.hasWarning++;
                    } else {
                        this.hasError++;
                    }
                    this.errorMessages.push(error);
                    if (i === numErrors) {
                        errorsList[this.field.Property] = this.errorMessages;
                        this.errorEvent.emit(errorsList);
                    }
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
        if (this.field.Classes) {
            return this.field.Classes;
        }
        return '';
    }

    public isInput(type) {
        const notInputs = [1, 5, 7];
        return notInputs.indexOf(type) === -1;
    }

    /**********
     *
     *  EVENT HANDLERS
     *
     */
    public onMultivalueMoveForward(action) {
        this.moveForwardEvent.emit(action);
    }

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
        if (combination.length === 1 && (combination[0] === 'enter' || combination[0] === 'tab')) {
            this.moveForwardEvent.emit({
                event: event,
                field: this.field
            });
            this.validateModel(this.getSimpleChange());

        } else if (combination.length === 2 && (combination[0] === 'shift' && combination[1] === 'tab')) {
            this.moveBackwardEvent.emit({
                event: event,
                field: this.field
            });
            this.validateModel(this.getSimpleChange());
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
