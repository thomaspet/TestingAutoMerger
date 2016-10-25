import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
declare var _, jQuery; // jquery and lodash

@Component({
    selector: 'uni-masked-input',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input
            *ngIf="control"
            type="text"
            [formControl]="control"
            [readonly]="field?.ReadOnly"
            [placeholder]="field?.Placeholder || ''"
            (focus)="focusHandler()"
        />
    `
})
export class UniMaskedInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniMaskedInput> = new EventEmitter<UniMaskedInput>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public focusEvent: EventEmitter<UniMaskedInput> = new EventEmitter<UniMaskedInput>(true);

    private maskedInput: kendo.ui.MaskedTextBox;

    constructor(public elementRef: ElementRef, private cd: ChangeDetectorRef) {
    }

    public focus() {
        jQuery(this.elementRef.nativeElement)
            .find('input')
            .first()
            .focus();
        return this;
    }

    public focusHandler() {
        this.focusEvent.emit(this);
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
        if (this.maskedInput) {
            this.maskedInput.value(this.control.value);
        }
    }

    public ngAfterViewInit() {
        var maskedInput: kendo.ui.MaskedTextBox;

        var options: kendo.ui.MaskedTextBoxOptions = this.field.Options || {};
        var self = this;
        options.change = function () {
            var val = this.value();
            self.control.setValue(this.raw(), {});
            // to avoid mask disappearing in input field (due to control storing the raw string)
            this.value(val);
            _.set(self.model, self.field.Property, this.raw());
            self.changeEvent.emit(self.model);
        };

        maskedInput = jQuery(this.elementRef.nativeElement)
            .find('input')
            .first()
            .kendoMaskedTextBox(options)
            .data('kendoMaskedTextBox');

        this.maskedInput = maskedInput;

        // init to control value
        if (!_.isNil(this.control.value) && this.control.value.length > 0) {
            maskedInput.value(this.control.value);
        }
        this.readyEvent.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        var inputTemplateString = `
            <input
                *ngIf="control"
                type="text"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
            />
        `;
        jQuery(this.elementRef.nativeElement).empty();
        jQuery(this.elementRef.nativeElement).html(inputTemplateString);
    }
}
