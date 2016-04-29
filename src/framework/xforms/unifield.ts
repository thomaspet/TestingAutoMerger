import {Component, Input, ViewChild, ChangeDetectorRef, ComponentRef, SimpleChange, ChangeDetectionStrategy} from 'angular2/core';
import {FORM_DIRECTIVES, FORM_PROVIDERS, ControlGroup, Control} from 'angular2/common';
import {FieldLayout} from '../../app/unientities';
import {UniComponentLoader} from '../core/componentLoader';
import {UNI_CONTROL_DIRECTIVES} from '../controls';
declare var _; // lodash

@Component({
    selector: 'uni-field',
    template: `
        <label ngForm *ngIf="isInput()" [class.error]="hasError()" [class]="buildClassString()" [class.-has-linebreak]="hasLineBreak()">
            <span>{{field.Label}}</span>
            <uni-component-loader [type]="ComponentType"></uni-component-loader>
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

    @ViewChild(UniComponentLoader)
    public ucl: UniComponentLoader;

    public get ComponentType() { return UNI_CONTROL_DIRECTIVES[this.field.FieldType]; }

    public classes: (string | Function)[] = [];

    public component: any;

    constructor(private ref: ChangeDetectorRef) {}

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
        var control = new Control(value);
        
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
        } else {
            this.ucl.onLoad.subscribe((cmp) => {
                cmp.field = self.field;
                cmp.control = control;
                cmp.model = self.model;
                self.component = cmp;
                self.ref.markForCheck(); // first time we say we should hydratate component
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
        // TODO: Should access to the component and check the control
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

