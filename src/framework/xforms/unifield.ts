import {Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, Control} from 'angular2/common';
import {FieldLayout} from '../../app/unientities';
import {UniComponentLoader} from '../core/componentLoader';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
import {MessageComposer} from './composers/messageComposer';
import {ValidatorsComposer} from './composers/validatorsComposer';

declare var _; // lodash

@Component({
    selector: 'uni-field',
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()" [class.-has-linebreak]="hasLineBreak()">
            <span>{{field.Label}}</span>
            <uni-component-loader [type]="ComponentType"></uni-component-loader>
            <show-error [control]="component?.control" [messages]="messages"></show-error>
        </label>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    directives: [FORM_DIRECTIVES, UniComponentLoader],
    providers: [FORM_PROVIDERS],
})
export class UniField {
    @Input()
    public controls: ControlGroup;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<UniField> = new EventEmitter<UniField>(true);

    @ViewChild(UniComponentLoader)
    public ucl: UniComponentLoader;

    public get ComponentType() { return UNI_CONTROL_DIRECTIVES[this.field.FieldType]; }

    public classes: (string | Function)[] = [];

    public messages: {};

    private component: any;

    public get Component() { return this.component; }

    constructor(private ref: ChangeDetectorRef) { }

    public setFocus() {
        if (this.Component.setFocus) {
            this.Component.setFocus();
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
        if (this.ucl) {
            this.initComponent();
        }
    }

    public ngAfterViewInit() {
        this.initComponent();
    }

    private initComponent() {
        var self = this;

        var value = _.get(this.model, this.field.Property);

        this.messages = MessageComposer.composeMessages(this.field);

        var syncvalidators = ValidatorsComposer.composeSyncValidators(this.field);
        var asyncvalidators = ValidatorsComposer.composeAsyncValidators(this.field);
        var control = new Control(value, syncvalidators, asyncvalidators);
        this.controls.addControl(this.field.Property, control);
        control.valueChanges.subscribe((newValue: any) => {
            if (control.valid) {
                _.set(self.model, self.field.Property, newValue);
            }
        });
        if (this.component) {
            this.component.field = self.field;
            this.component.control = control;
            this.component.model = self.model;
            this.onReady.emit(this);
        } else {
            this.ucl.onLoad.subscribe((cmp) => {
                cmp.field = self.field;
                cmp.control = control;
                cmp.model = self.model;
                self.component = cmp;
                self.ref.markForCheck(); // first time we say we should hydratate component
                self.onReady.emit(self);
            });
        }

    }

    private isInput() {
        return !this.isCheckbox() && !this.isRadioGroup();
    }
    private isCheckbox() {
        return this.field.FieldType === 8;
    }
    private isRadioGroup() {
        return this.field.FieldType === 9;
    }
    private hasError() {
        if (this.Component) {
            return !this.Component.control.valid;
        }
        return false;
    }
    private buildClassString() {
        // TODO: add classess
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
}

