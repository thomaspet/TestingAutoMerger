import {
    Component, Input, Output, HostBinding, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener,
    ChangeDetectionStrategy, ElementRef, PipeTransform, Pipe
} from '@angular/core';
import {UniFieldLayout} from './interfaces';
import * as _ from 'lodash';
import {KeyCodes} from '../../../app/services/common/keyCodes';
import { Observable } from 'rxjs/Observable';

export interface UniFormError {
    errorMessage: string;
    field: UniFieldLayout;
    value: any;
    isWarning: boolean;
}
@Pipe({
    name: 'isRequired',
    pure: false
})
export class IsRequiredPipe implements PipeTransform {
    public transform(value: string, field: UniFieldLayout): string {
        if (field.Required) {
            return value + '*';
        } else {
            return value;
        }
    }
}
@Component({
    selector: 'uni-field',
    host: {'[class]': 'buildClassString()'},
    template: `
        <label
            *ngIf="field?.FieldType !== 1">
            <span [hidden]="!isInput(field?.FieldType)"
                  [title]="field?.Label">
                  {{field?.Label | isRequired:field}}
            </span>
            <uni-autocomplete-input #selectedComponent *ngIf="field?.FieldType === 0"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-autocomplete-input>
            <uni-date-input #selectedComponent *ngIf="field?.FieldType === 2"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-date-input>
            <uni-select-input #selectedComponent *ngIf="field?.FieldType === 3"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-select-input>
            <uni-checkbox-input #selectedComponent *ngIf="field?.FieldType === 5"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-checkbox-input>
            <uni-numeric-input #selectedComponent *ngIf="field?.FieldType === 6"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-numeric-input>
            <uni-radio-input #selectedComponent *ngIf="field?.FieldType === 7"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-radio-input>
            <uni-checkboxgroup-input #selectedComponent *ngIf="field?.FieldType === 8"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-checkboxgroup-input>

            <uni-radiogroup-input #selectedComponent *ngIf="field?.FieldType === 9"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-radiogroup-input>
            <uni-text-input #selectedComponent *ngIf="field?.FieldType === 10"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-text-input>

            <uni-email-input #selectedComponent *ngIf="field?.FieldType === 11"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-email-input>
            <uni-password-input #selectedComponent *ngIf="field?.FieldType === 12"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-password-input>

            <uni-hyperlink-input #selectedComponent *ngIf="field?.FieldType === 13"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-hyperlink-input>
            <uni-multivalue-input #selectedComponent *ngIf="field?.FieldType === 14"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
                (moveForwardEvent)="onMultivalueMoveForward($event)"
            ></uni-multivalue-input>

            <uni-url-input #selectedComponent *ngIf="field?.FieldType === 15"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-url-input>

            <uni-textarea-input #selectedComponent *ngIf="field?.FieldType === 16"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-textarea-input>
            <localdate-picker-input #selectedComponent *ngIf="field?.FieldType === 17"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></localdate-picker-input>
            <uni-search-wrapper #selectedComponent *ngIf="field?.FieldType === 18"
                [field]="field"
                [model]="model"
                [asideGuid]="asideGuid"
                (readyEvent)="onReadyHandler($event)"
                (changeEvent)="onChangeHandler($event)"
                (inputEvent)="onInputHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-search-wrapper>
            <button class="helpTextToggle" tabindex="-1" type="button" *ngIf="field?.HelpText">Help</button>
            <aside [id]="asideGuid" class="helpText" *ngIf="field?.HelpText" [innerHTML]="field?.HelpText"></aside>
            <ng-template ngFor let-error [ngForOf]="errorMessages" let-k="index">
                <small role="alert" [class.bad]="!error?.isWarning" [class.warn]="error?.isWarning">
                    {{error | uniformErrorTemplate}}
                </small>
            </ng-template>
        </label>

        <uni-button-input #selectedComponent *ngIf="field?.FieldType === 1"
            [field]="field"
            [model]="model"
            [asideGuid]="asideGuid"
            (readyEvent)="onReadyHandler($event)"
            (changeEvent)="onChangeHandler($event)"
            (inputEvent)="onInputHandler($event)"
            (focusEvent)="onFocusHandler($event)"
        ></uni-button-input>
    `,
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
        // this.Component.then((cmp: any) => cmp.readMode());
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
            let error: UniFormError | Observable<UniFormError> = validator(value, field);
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
        let numErrors = errorMessages.length;
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

    @HostListener('keydown', ['$event'])
    public keyDownHandler(event: KeyboardEvent) {
        const key: string = KeyCodes[event.which || event.keyCode];
        const ctrl: boolean = event.ctrlKey;
        const shift: boolean = event.shiftKey;
        var combination: string[] = [];
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
            var methodName = combination.join('_');
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

        } else if (combination.length === 2 && (combination[0] === 'shift' && combination[0] === 'tab')) {
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
            var method = <any>this.field.Options.events[eventName];
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
        let simplechange = {};
        simplechange[prop] = new SimpleChange(null, this.getModelValue(), false);
        return simplechange;
    }

    public getModelValue() {
        return _.get(this.model, this.field.Property);
    }
}
