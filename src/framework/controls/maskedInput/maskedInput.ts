import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {FieldLayout} from '../../../app/unientities';

declare var jQuery, _;

@Component({
    selector: 'uni-masked',
    directives: [FORM_DIRECTIVES],
    template: `
            <input *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
        />
    `
})
export class UniMaskedInput {
    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);
    public isReady: boolean = true;

    private nativeElement: any;
    private maskedInput: any;

    get OnValueChanges() {
        return this.control.valueChanges;
    }

    get FormControl() {
        return this.control;
    }
    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.nativeElement
            .find('input')
            .first()
            .focus();
        return this;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public ngAfterViewInit() {
        var maskedInput;
        if (!this.field) {
            this.ngOnChanges({
                field: this.field
            });
        }
        
        this.onReady.emit(this);
    }

    public ngOnChanges(changes) {
        if (changes['field']) {
            var maskedInput;
            var control: Control = this.control;
            var options: kendo.ui.MaskedTextBoxOptions = this.field.Options;

            var self = this;
            control.valueChanges.subscribe((newValue) => {
                _.set(self.model, self.field.Property, newValue);
            })

            options.change = function () {
                var val = this.value();
                control.updateValue(this.raw(), {});
                // to avoid mask disappearing in input field (due to control storing the raw string)
                this.value(val);
            };

            maskedInput = this.nativeElement
                .find('input')
                .first()
                .kendoMaskedTextBox(options)
                .data('kendoMaskedTextBox');

            this.maskedInput = maskedInput;

            // init to control value
            if (!_.isNil(control.value) && control.value.length > 0) {
                maskedInput.value(control.value);
            }    
        }
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(`
            <input *ngIf="control"
                type="text"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
            />
        `);
    }
}
