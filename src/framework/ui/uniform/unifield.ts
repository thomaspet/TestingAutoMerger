import {
    Component, Input, Output, HostBinding, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, HostListener,
    ChangeDetectionStrategy, ElementRef
} from '@angular/core';
import {UniFieldLayout} from './interfaces';
import * as _ from 'lodash';
import {KeyCodes} from '../../../app/services/common/keyCodes';

@Component({
    selector: 'uni-field',
    host: {'[class]': 'buildClassString()'},
    template: `
        <label
            [class.error]="hasError()"
            *ngIf="field?.FieldType !== 1">
            <span [hidden]="!isInput(field?.FieldType)"
                  [title]="field?.Label">
                  {{field?.Label}}
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
            <show-error [control]="control" [messages]="messages"></show-error>
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

    @Output() public readyEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);
    @Output() public changeEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() public inputEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() public focusEvent: EventEmitter<UniField> = new EventEmitter<UniField>(true);
    @Output() public moveForwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);
    @Output() public moveBackwardEvent: EventEmitter<Object> = new EventEmitter<Object>(true);

    public classes: (string | Function)[] = [];
    private asideGuid: string = 'unifield-' + performance.now();

    private componentResolver: any;
    @ViewChild('selectedComponent')
    public component: any;
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

    constructor(private ref: ChangeDetectorRef, private elementRef: ElementRef) {
        this.readyEvent.subscribe(() => {
            const input = this.elementRef.nativeElement.querySelector('input');
            if (input) {
                input.addEventListener('blur', event => this.eventHandler(event.type, event));
                input.addEventListener('focus', event => this.eventHandler(event.type, event));
            }
        });
    }

    public onFocusHandler(event) {
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
        //this.Component.then((cmp: any) => cmp.readMode());
    }

    public editMode() {
        // need markforcheck
        if (this.component) {
            this.component.editMode();
            this.ref.markForCheck();
        }
        // this.Component.then((cmp: any) => cmp.editMode());
    }

    private onReadyHandler() {
        if (this.componentResolver) {
            this.componentResolver(this.component);
        }
        this.readyEvent.emit(this);
    }

    private onChangeHandler(model) {
        this.changeEvent.emit(model);
    }

    private onInputHandler(model) {
        this.inputEvent.emit(model);
    }

    private hasError() {
        return this.component && this.component.control && !this.component.control.valid;
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
        } else if (combination.length === 2 && (combination[0] === 'shift' && combination[0] === 'tab')) {
            this.moveBackwardEvent.emit({
                event: event,
                field: this.field
            });
        }
        return;
    }

    private eventHandler(eventName, event) {
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
}
