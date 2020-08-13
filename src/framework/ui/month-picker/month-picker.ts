import { Component, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {UniDateAdapter} from '@app/date-adapter';
import * as moment from 'moment';

@Injectable()
export class CustomDateAdapter extends UniDateAdapter {
    format(date: Date): string {
        return moment(date).format('MMMM YYYY');
    }
}

@Component({
    selector: 'month-picker',
    template: `
        <i class="material-icons" >calendar_today</i>
        <input readonly
            (click)="datepicker.open()"
            [(ngModel)]="value"
            [matDatepicker]="datepicker"
        />

        <mat-datepicker
            #datepicker
            startView="year"
            panelClass="month-picker"
            (monthSelected)="onMonthSelected($event, datepicker)">
        </mat-datepicker>
    `,
    styleUrls: ['./month-picker.sass'],
    providers: [
        {provide: DateAdapter, useClass: CustomDateAdapter},
    ]
})
export class MonthPicker {
    @Input() value: Date;
    @Output() valueChange = new EventEmitter<Date>();

    onMonthSelected(value, datepicker) {
        datepicker.close();
        this.valueChange.emit(value);
    }
}
