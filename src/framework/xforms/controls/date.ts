import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../unifieldlayout';
import {autocompleteDate} from '../shared/autocompleteDate';
import {Observable} from 'rxjs/Rx';

declare var jQuery, _, kendo; // jquery and lodash

var parseFormats = [
    'dd-MM-yyyy',
    'dd/MM/yyyy',
    'dd.MM.yyyy',
    'ddMMyyyy',
    'yyyy-MM-ddTHH:mm:ss'
];

@Component({
    selector: 'uni-date-input',
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
export class UniDateInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniDateInput> = new EventEmitter<UniDateInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    private lastControlValue: string;
    private datepicker: any;
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

    public ngOnChanges(changes) {
        if (changes['field']) {
            this.lastControlValue = this.control.value;
            if (this.datepicker) {
                this.datepicker.value(_.get(this.model, this.field.Property));
            }
        }
    }

    public ngAfterViewInit() {
        var options = this.field.Options || {};
        var datepicker, self = this;

        if (options.autocomplete === undefined) {
            options.autocomplete = true;
        }

        options.format = options.format || 'dd.MM.yyyy';
        options.parseFormats = options.parseFormats || parseFormats;

        options.change = function () {

            var date = this.value();

            if (options.autocomplete && (date === null || date === undefined)) {
                var autocompleted = autocompleteDate(this.element.val());
                if (autocompleted) {
                    date = autocompleted;
                }
            }

            if (date) {
                this.value(date);
                _.set(self.model, self.field.Property, date);
                self.onChange.emit(self.model);
            } else {
                self.control.updateValue(null, {});
                _.set(self.model, self.field.Property, null);
                self.onChange.emit(self.model);
            }
        };
        
        var input = jQuery(this.elementRef.nativeElement)
            .find('input')
            .first();
        datepicker = input
            .kendoDatePicker(options)
            .data('kendoDatePicker');

        // trigger kendo change event on keyup (enter) and blur in the textbox
        Observable.fromEvent(input, 'keyup')
            .subscribe(function (event: any) {
                if (event.keyCode && event.keyCode === 13) {
                    datepicker.trigger('change');
                }
            });

        Observable.fromEvent(input, 'blur').subscribe(() => {
            datepicker.trigger('change');
        });

        datepicker.value(_.get(this.model, this.field.Property));
        this.datepicker = datepicker;
        this.onReady.emit(this);
    }
    
    public ngOnDestroy() {
        var inputTemplate = `
            <input
                *ngIf="control"
                type="text"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Options?.placeholder || ''"
            />
        `;
        jQuery(this.elementRef.nativeElement).empty();
        jQuery(this.elementRef.nativeElement).html(inputTemplate);
    }    
}
