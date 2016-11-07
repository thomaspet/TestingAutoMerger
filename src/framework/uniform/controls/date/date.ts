import {Component, Input, Output, ElementRef, ViewChild, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout, KeyCodes} from '../../interfaces';
import {autocompleteDate} from '../../shared/autocompleteDate';
import moment from 'moment';
import {Observable} from 'rxjs/Observable';
declare var _;

@Component({
    selector: 'uni-date-input',
    template: `
        <section class="uni-datepicker" (clickOutside)="close()">
            <input #input
                *ngIf="control"
                type="text"
                (change)="inputChange()"
                (focus)="onFocus()"
                [formControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
            />
            <button type="button"
                    class="uni-datepicker-calendarBtn"
                    (click)="calendarOpen = !calendarOpen"
                    [disabled]="field?.ReadOnly"
                    (focus)="focus()"
            >Kalender</button>

            <uni-calendar [attr.aria-expanded]="calendarOpen"
                          [date]="selectedDate"
                          (dateChange)="dateSelected($event)">
            </uni-calendar>
        </section>
    `
})
export class UniDateInput {
    @ViewChild('input')
    private inputElement: ElementRef;

    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Output()
    public readyEvent: EventEmitter<UniDateInput> = new EventEmitter<UniDateInput>();

    @Output()
    public changeEvent: EventEmitter<Date> = new EventEmitter<Date>();

    @Output()
    public focusEvent: EventEmitter<UniDateInput> = new EventEmitter<UniDateInput>();

    private calendarOpen: boolean;
    private selectedDate: Date;
    private options: any;

    constructor(private cd: ChangeDetectorRef) {
    }

    public ngOnChanges(changes) {
        if (this.control && this.field) {
            this.options = this.field.Options || {};
            let value = _.get(this.model, this.field.Property);

            if (value) {
                this.selectedDate = new Date(value);
                this.control.setValue(moment(this.selectedDate).format('L'));
            }
        }
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
        this.createTabListener();
        this.createOpenCloseListeners();
    }

    private createOpenCloseListeners() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown');
        const f4AndSpaceEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return event.keyCode === KeyCodes.F4 || event.keyCode === KeyCodes.SPACE;
        });
        const arrowDownEvent = keyDownEvent.filter((event: KeyboardEvent) => {
            return (event.keyCode === KeyCodes.ARROW_UP
                || event.keyCode === KeyCodes.ARROW_DOWN)
                && event.altKey;
        });

        Observable.merge(f4AndSpaceEvent, arrowDownEvent)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.toggle();
            });

        keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.ESC)
            .subscribe((event: KeyboardEvent) => {
                event.preventDefault();
                event.stopPropagation();
                this.close();

            });
    }

    public open() {
        this.calendarOpen = true;
        this.cd.markForCheck();
    }

    public close() {
        this.calendarOpen = false;
        this.cd.markForCheck();
    }

    public toggle() {
        if (!this.calendarOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    public onFocus() {
        this.focusEvent.emit(this);
    }

    public focus() {
        this.inputElement.nativeElement.focus();
        this.inputElement.nativeElement.select();
    }

    public readMode() {
        this.field.ReadOnly = true;
    }

    public editMode() {
        this.field.ReadOnly = false;
    }

    private inputChange() {
        const value = this.control.value;
        let date;

        if ((value && value.length) || this.options.autocompleteEmptyValue) {
            date = autocompleteDate(value) || null;
        }

        this.dateSelected(date);
    }

    private dateSelected(date) {
        this.selectedDate = date;
        this.control.setValue(date ? moment(date).format('L') : '');
        _.set(this.model, this.field.Property, date);
        this.setFocusOnNextField();
        this.changeEvent.emit(this.model);
    }

    private createTabListener() {
        const keyDownEvent = Observable.fromEvent(this.inputElement.nativeElement, 'keydown');
        const tabAndEnterEvent = keyDownEvent.filter((event: KeyboardEvent) => event.keyCode === KeyCodes.TAB || event.keyCode === KeyCodes.ENTER);
        tabAndEnterEvent.subscribe((event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.shiftKey) {
                this.setFocusOnPrevField();
                this.close();
            } else {
                this.setFocusOnNextField();
                this.close();
            }
        });
    }

    private setFocusOnNextField() {
        const uniFieldParent = this.findAncestor(this.inputElement.nativeElement, 'uni-field');
        let nextUniField = uniFieldParent.nextElementSibling;
        if (nextUniField) {
            if (nextUniField.tagName === 'UNI-LINEBREAK') {
                nextUniField = nextUniField.nextElementSibling;
            }
            const input = <HTMLInputElement>nextUniField.querySelector('input,textarea,select,button');
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    private setFocusOnPrevField() {
        const uniFieldParent = this.findAncestor(this.inputElement.nativeElement, 'uni-field');
        let nextUniField = uniFieldParent.previousElementSibling;
        if (nextUniField) {
            if (nextUniField.tagName === 'UNI-LINEBREAK') {
                nextUniField = nextUniField.previousElementSibling;
            }
            const input = <HTMLInputElement>nextUniField.querySelector('input,textarea,select,button');
            if (input) {
                input.focus();
                input.select();
            }
        }
    }

    private findAncestor(element: HTMLElement, selector: string): HTMLElement {
        element = element.parentElement;
        while (element) {
            if (element.matches(selector)) {
                return element;
            }
            element = element.parentElement;
        }
    }
}
