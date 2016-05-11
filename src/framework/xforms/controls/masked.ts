import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {FieldLayout} from '../../../app/unientities';
declare var _, jQuery; // jquery and lodash

@Component({
    selector: 'uni-text-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="text"
            [ngFormControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Options?.placeholder || ''"
        />
    `
})
export class UniMaskedInput {
    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniMaskedInput> = new EventEmitter<UniMaskedInput>(true);

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);

    private maskedInput: kendo.ui.MaskedTextBox;

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        this.elementRef.nativeElement.children[0].focus();
        return this;
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngOnChanges() {
        this.maskedInput.value(this.control.value);
    }

    public ngAfterViewInit() {
        var maskedInput;

        var options: kendo.ui.MaskedTextBoxOptions = this.field.Options || {};
        var self = this;
        options.change = function () {
            var val = this.value();
            self.control.updateValue(this.raw(), {});
            // to avoid mask disappearing in input field (due to control storing the raw string)
            this.value(val);
            _.set(self.model, self.field.Property, this.raw());
            self.onChange.emit(self.model);
        };

        maskedInput = this.elementRef.nativeElement
            .children[0]
            .kendoMaskedTextBox(options)
            .data('kendoMaskedTextBox');

        this.maskedInput = maskedInput;

        // init to control value
        if (!_.isNil(this.control.value) && this.control.value.length > 0) {
            maskedInput.value(this.control.value);
        }
        this.onReady.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        var inputTemplateString = `
            <input
                *ngIf="control"
                type="text"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Options?.placeholder || ''"
            />
        `;
        jQuery(this.elementRef.nativeElement).empty();
        jQuery(this.elementRef.nativeElement).html(inputTemplateString);
    }
}