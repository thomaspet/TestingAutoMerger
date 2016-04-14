import {Component, ElementRef, Input, AfterViewInit, OnDestroy} from 'angular2/core';
import {Control} from 'angular2/common';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/FromEventObservable';

import {InputTemplateString} from '../inputTemplateString';
import {UniFieldBuilder} from '../../forms/builders/uniFieldBuilder';
declare var jQuery, _;

var parseFormats = [
    'dd-MM-yyyy',
    'dd/MM/yyyy',
    'dd.MM.yyyy',
    'ddMMyyyy',
    'yyyy-MM-ddTHH:mm:ss'
];

@Component({
    selector: 'uni-datepicker',
    template: InputTemplateString
})
export class UniDatepicker implements AfterViewInit, OnDestroy {
    @Input()
    public config: UniFieldBuilder;

    public datepicker: kendo.ui.DatePicker;

    public nativeElement: any;
    
    constructor(public elementRef: ElementRef) {
        this.nativeElement = jQuery(this.elementRef.nativeElement);
    }

    public setFocus() {
        this.nativeElement
            .find('input')
            .first()
            .focus()
        return this;
    }

    public refresh(value: string): void {
        value = value || '';
        var date = kendo.parseDate(value, parseFormats);
        this.datepicker.value(date);
        this.datepicker.trigger('change');
    }

    public ngAfterViewInit() {
        var control: Control = this.config.control;
        var options = this.config.kOptions;
        var datepicker;

        this.config.fieldComponent = this;

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
                control.updateValue(kendo.toString(date, 'yyyy-MM-ddTHH:mm:ss'), {});
                this.value(date);
            } else {
                control.updateValue(null, {});
            }
        };
        datepicker = this.nativeElement
            .find('input')
            .first()
            .kendoDatePicker(options)
            .data('kendoDatePicker');

        // trigger kendo change event on keyup (enter) and blur in the textbox
        Observable.fromEvent(this.nativeElement, 'keyup')
            .subscribe(function (event: any) {
                if (event.keyCode && event.keyCode === 13) {
                    datepicker.trigger('change');
                }
            });

        Observable.fromEvent(this.nativeElement.find('input').first(), 'blur').subscribe(() => {
            datepicker.trigger('change');
        });

        datepicker.value(new Date(control.value));
        this.datepicker = datepicker;
        this.config.ready.emit(this);
    }

    // remove kendo markup when component is destroyed to avoid duplicates
    public ngOnDestroy() {
        this.nativeElement.empty();
        this.nativeElement.html(InputTemplateString);
    }
}

export function autocompleteDate(inputValue: string): Date {
    'use strict';

    var input = inputValue.replace(/[^0-9]/g, '');

    var day, month, year;
    var date = new Date();

    switch (input.length) {
        case 0:
            return date;
        case 1:
            day = parseInt(input, 10);
            month = date.getMonth();
            year = date.getFullYear();
            break;
        case 2:
            day = parseInt(input, 10);
            month = date.getMonth();
            year = date.getFullYear();
            break;
        case 3:
            day = parseInt(input.slice(0, 2), 10);
            month = parseInt(input[2], 10) - 1;
            year = date.getFullYear();
            if (day > new Date(0, month, year).getDate()) {
                day = parseInt(input[0], 10);
                month = parseInt(input.slice(1), 10) - 1;
            }
            break;
        case 4:
            day = parseInt(input.slice(0, 2), 10);
            month = parseInt(input.slice(2), 10) - 1;
            year = date.getFullYear();
            break;
        case 6:
            day = parseInt(input.slice(0, 2), 10);
            month = parseInt(input.slice(2, 4), 10) - 1;
            year = parseInt(date.getFullYear().toString().substr(0, 2) + input.slice(4), 10);
            break;
        default:
            return null;
    }

    if (year < 1900) {
        return null;
    }
    if (month < 0 || month > 12) {
        return null;
    }
    if (day > new Date(0, month, 0).getDate()) {
        console.log('null');
        console.log(day);
        console.log(new Date(0, month, 0).getDate());
        return null; // if (day > max day of month)
    }
    return new Date(year, month, day);
}
