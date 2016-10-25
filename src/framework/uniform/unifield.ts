import {
    Component, Input, Output, HostBinding, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener,
    ChangeDetectionStrategy, ElementRef
} from '@angular/core';
import {FormGroup, FormControl, ValidatorFn} from '@angular/forms';
import {UniFieldLayout, KeyCodes} from './interfaces';
import {MessageComposer} from './composers/messageComposer';
import {ValidatorsComposer} from './composers/validatorsComposer';

declare var _; // lodash

@Component({
    selector: 'uni-field',
    host: {'[class]': 'buildClassString()'},
    template: `
        <label 
            [class.error]="hasError()">
            <span [hidden]="!isInput(field?.FieldType)">{{field?.Label}}</span>

            <uni-autocomplete-input #selectedComponent *ngIf="field?.FieldType === 0 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-autocomplete-input>
            <uni-button-input #selectedComponent *ngIf="field?.FieldType === 1 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-button-input>
            <uni-date-input #selectedComponent *ngIf="field?.FieldType === 2 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-date-input>
            <uni-select-input #selectedComponent *ngIf="field?.FieldType === 3 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-select-input>
            <uni-masked-input #selectedComponent *ngIf="field?.FieldType === 4 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-masked-input>
            <uni-checkbox-input #selectedComponent *ngIf="field?.FieldType === 5 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-checkbox-input>
            <uni-numeric-input #selectedComponent *ngIf="field?.FieldType === 6 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-numeric-input>
            <uni-radio-input #selectedComponent *ngIf="field?.FieldType === 7 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-radio-input>
            <uni-checkboxgroup-input #selectedComponent *ngIf="field?.FieldType === 8 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-checkboxgroup-input>
            <uni-radiogroup-input #selectedComponent *ngIf="field?.FieldType === 9 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-radiogroup-input>
            <uni-text-input #selectedComponent *ngIf="field?.FieldType === 10 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-text-input>
            <uni-email-input #selectedComponent *ngIf="field?.FieldType === 11 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-email-input>
            <uni-password-input #selectedComponent *ngIf="field?.FieldType === 12 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-password-input>
            <uni-hyperlink-input #selectedComponent *ngIf="field?.FieldType === 13 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-hyperlink-input>  
            <uni-multivalue-input #selectedComponent *ngIf="field?.FieldType === 14 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-multivalue-input>
            <uni-url-input #selectedComponent *ngIf="field?.FieldType === 15 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-url-input> 
            <uni-textarea-input #selectedComponent *ngIf="field?.FieldType === 16 && control" 
                [control]="control" [field]="field" [model]="model" (readyEvent)="onReadyHandler($event)" (changeEvent)="onChangeHandler($event)"
                (focusEvent)="onFocusHandler($event)"
            ></uni-textarea-input>                         
            
            <show-error [control]="control" [messages]="messages"></show-error>
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniField {
    @Input()
    public controls: FormGroup;

    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Output()
    public readyEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);

    public classes: (string | Function)[] = [];

    public messages: {};

    @ViewChild('selectedComponent')
    private component: any;

    public get Component() { return this.component; }

    @HostBinding('hidden')
    public get Hidden() { return this.field.Hidden; }

    public set Hidden(value: boolean) {
        this.field.Hidden = value;
        this.ref.markForCheck();
    }

    public control: FormControl;


    constructor(private ref: ChangeDetectorRef, private elementRef: ElementRef) {
        this.readyEvent.subscribe(() => {
            const input = this.elementRef.nativeElement.querySelector('input');
            if (input) {
                input.addEventListener('blur', event => this.eventHandler(event.type));
                input.addEventListener('focus', event => this.eventHandler(event.type));
            }
        });
    }

    public onFocusHandler(event) {
        this.focusEvent.emit(event);
    }

    public focus() {
        if (this.Component.focus) {
            this.Component.focus();
        }
    }

    public readMode() {
        if (this.Component.readMode) {
            this.Component.readMode();
            this.ref.markForCheck();
        }
    }

    public editMode() {
        if (this.Component.editMode) {
            this.Component.editMode();
            this.ref.markForCheck();
        }
    }

    public addClass(name: string, value: any) {
        this.classes[name] = value;
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        if (changes['model']) {
            var value = _.get(this.model, this.field.Property);
            this.messages = MessageComposer.composeMessages(this.field);
            var syncvalidators: ValidatorFn = ValidatorsComposer.composeSyncValidators(this.field);
            var asyncvalidators: ValidatorFn = ValidatorsComposer.composeAsyncValidators(this.field);
            var control = new FormControl(value, syncvalidators, asyncvalidators);
            this.controls.addControl(this.field.Property, control);
            this.control = control;
        }
    }

    private onReadyHandler() {
        this.readyEvent.emit(this);
    }

    private onChangeHandler(model) {
        this.changeEvent.emit(model);
    }
    
    private hasError() {
        if (this.Component) {
            return !this.Component.control.valid;
        }
        return false;
    }
    
    private buildClassString() {
        if (this.field.Classes) {
            return this.field.Classes;
        }
        return '';        
    }

    private isInput(type) {
        const notInputs = [1, 5, 7];
        return notInputs.indexOf(type) === -1;
    }

    /**********
     *
     *  EVENT HANDLERS
     *
     */
    @HostListener('keydown', ['$event'])
    public keyDownHandler(event: MouseEvent) {
        const key: string = KeyCodes[event.which];
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
            combination.push(key.toLowerCase());
        }
        if (combination.length > 0) {
            var methodName = combination.join('_');
            this.eventHandler(methodName);
        }
        return;
    }

    private eventHandler(eventName) {
        if (this.field.Options && this.field.Options.events) {
            var method = this.field.Options.events[eventName];
            if (method) {
                event.stopPropagation();
                event.preventDefault();
                method(this.model);
            }
        }
    }
}

