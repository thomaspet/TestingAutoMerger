import {Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, Renderer} from '@angular/core';
import {Control} from '@angular/common';
import {UniFieldLayout} from '../../interfaces';
import {autocompleteDate} from '../../shared/autocompleteDate';
import {UniCalendar} from './calendar';
import {ClickOutsideDirective} from '../../../core/clickOutside';

import moment from 'moment';
declare var _;

@Component({
    selector: 'uni-date-input',
    template: `
        <section class="uni-datepicker" (clickOutside)="hideCalendar()">
            <input #input
                *ngIf="control"
                type="text"
                (change)="inputChange()"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Options?.placeholder || ''"
            />
            <button class="uni-datepicker-calendarBtn"
                    (click)="calendarOpen = !calendarOpen"
                    [disabled]="field?.ReadOnly"
            >Kalender</button>

            <uni-calendar [attr.aria-expanded]="calendarOpen"
                          [value]="selectedDate"
                          (valueChange)="dateSelected($event)">
            </uni-calendar>
        </section>
    `,
    directives: [ClickOutsideDirective, UniCalendar],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniDateInput {
    @ViewChild('input')
    private inputElement: ElementRef;

    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniDateInput> = new EventEmitter<UniDateInput>();

    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>();

    private selectedDate: Date;
    private calendarOpen: boolean;

    constructor(private cd: ChangeDetectorRef, private renderer: Renderer) {
        this.calendarOpen = false;
    }

    public ngOnChanges(changes) {
        if (this.control && this.field) {
            let value = _.get(this.model, this.field.Property);

            if (value) {
                this.selectedDate = new Date(value);
                this.control.updateValue(moment(this.selectedDate).format('L'));
            }
        }

    }

    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    public focus() {
        this.inputElement.nativeElement.focus();
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    private inputChange() {
        const value = this.control.value;
        let date;

        if ((value && value.length) || this.field.Options.autocompleteEmptyValue) {
            date = autocompleteDate(value) || null;
        }

        this.dateSelected(date);
    }

    private dateSelected(date) {
        // REVISIT: toDateString is a temporary fix for backend timezone issues and should be changed!
        _.set(this.model, this.field.Property, date.toDateString());
        this.onChange.emit(this.model);
        this.selectedDate = date;

        if (date) {
            this.control.updateValue(moment(date).format('L'));
        } else {
            this.control.updateValue('');
        }
    }

    private hideCalendar() {
        this.calendarOpen = false;
    }

}
