import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener, ChangeDetectionStrategy} from '@angular/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, Control} from '@angular/common';
import {UniFieldLayout} from './interfaces';
import {CONTROLS} from './controls/index';
import {ShowError} from './showError';
import {MessageComposer} from './composers/messageComposer';
import {ValidatorsComposer} from './composers/validatorsComposer';

declare var _; // lodash

var VALID_CONTROLS = CONTROLS.filter((x, i) => {
    return (
        i === 0
        || i === 2
        || i === 3
        || i === 4
        || i === 5
        || i === 6
        || i === 7
        || i === 8
        || i === 9
        || i === 10      
        || i === 11
        || i === 12
        || i === 13
        || i === 14
        || i === 15
        || i === 16
    );
});
@Component({
    selector: 'uni-field',
    template: `
        <label 
            [class.error]="hasError()" 
            [class]="buildClassString()" 
            [class.-has-linebreak]="hasLineBreak()"
            [hidden]="Hidden">
            <span [hidden]="!isInput(field?.FieldType)">{{field?.Label}}</span>

            <uni-autocomplete-input #selectedComponent *ngIf="field?.FieldType === 0 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-autocomplete-input>
            <uni-date-input #selectedComponent *ngIf="field?.FieldType === 2 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-date-input>
            <uni-select-input #selectedComponent *ngIf="field?.FieldType === 3 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-select-input>
            <uni-masked-input #selectedComponent *ngIf="field?.FieldType === 4 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-masked-input>
            <uni-checkbox-input #selectedComponent *ngIf="field?.FieldType === 5 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-checkbox-input>
            <uni-numeric-input #selectedComponent *ngIf="field?.FieldType === 6 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-numeric-input>
            <uni-radio-input #selectedComponent *ngIf="field?.FieldType === 7 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-radio-input>
            <uni-checkboxgroup-input #selectedComponent *ngIf="field?.FieldType === 8 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-checkboxgroup-input>
            <uni-radiogroup-input #selectedComponent *ngIf="field?.FieldType === 9 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-radiogroup-input>
            <uni-text-input #selectedComponent *ngIf="field?.FieldType === 10 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-text-input>
            <uni-email-input #selectedComponent *ngIf="field?.FieldType === 11 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-email-input>
            <uni-password-input #selectedComponent *ngIf="field?.FieldType === 12 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-password-input>
            <uni-hyperlink-input #selectedComponent *ngIf="field?.FieldType === 13 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-hyperlink-input>  
            <uni-multivalue-input #selectedComponent *ngIf="field?.FieldType === 14 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-multivalue-input>
            <uni-url-input #selectedComponent *ngIf="field?.FieldType === 15 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-url-input> 
            <uni-textarea-input #selectedComponent *ngIf="field?.FieldType === 16 && control" 
                [control]="control" [field]="field" [model]="model" (onReady)="onReadyHandler($event)" (onChange)="onChangeHandler($event)"
            ></uni-textarea-input>                         
            
            <show-error [control]="control" [messages]="messages"></show-error>
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, VALID_CONTROLS, ShowError],
    providers: [FORM_PROVIDERS],
})
export class UniField {    
    @Input()
    public controls: ControlGroup;

    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<UniField> = new EventEmitter<UniField>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public onTab: EventEmitter<UniField> = new EventEmitter<UniField>(true);

    @HostListener('keydown', ['$event'])
    public onTabHandler(event) {
        if (event.which === 9) {
            this.onTab.emit(this);
        }
    }

    public classes: (string | Function)[] = [];

    public messages: {};

    @ViewChild('selectedComponent')
    private component: any;

    public get Component() { return this.component; }

    public get Hidden() { return this.field.Hidden; }

    public set Hidden(value: boolean) {
        this.field.Hidden = value;
        this.ref.markForCheck();
    }

    public control: Control;


    constructor(private ref: ChangeDetectorRef) { }

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
            var syncvalidators = ValidatorsComposer.composeSyncValidators(this.field);
            var asyncvalidators = ValidatorsComposer.composeAsyncValidators(this.field);
            var control = new Control(value, syncvalidators, asyncvalidators);
            this.controls.addControl(this.field.Property, control);
            this.control = control;
        }
    }

    private onReadyHandler() {
        this.onReady.emit(this);
    }

    private onChangeHandler(model) {
        this.onChange.emit(model);
    }
    
    private hasError() {
        if (this.Component) {
            return !this.Component.control.valid;
        }
        return false;
    }
    
    private buildClassString() {
        var classes = [];
        var cls = this.classes;
        for (var cl in cls) {
            if (cls.hasOwnProperty(cl)) {
                var value = undefined;
                if (_.isFunction(cls[cl])) {
                    value = (<Function>cls[cl])();
                } else {
                    value = cls[cl];
                }
                if (value === true) {
                    classes.push(cl);
                }
            }
        }
        return classes.join(' ');
    }
    private hasLineBreak() {
        return this.field.LineBreak;
    }

    private isInput(type) {
        const notInputs = [5,7];
        return notInputs.indexOf(type) === -1;
    }
}

