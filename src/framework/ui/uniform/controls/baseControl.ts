import {Directive, EventEmitter, SimpleChange, SimpleChanges} from '@angular/core';
import {UniFieldLayout} from '../interfaces';
import {FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {Subscription} from 'rxjs';
import {get} from 'lodash';

export interface IBaseControl {
    model: any;
    field: UniFieldLayout;
    readyEvent: EventEmitter<any>;
    changeEvent: EventEmitter<any>;
    focusEvent: EventEmitter<any>;
    readOnly$: BehaviorSubject<boolean>;
    control: FormControl;
    messages: {};
    createControl: () => void;
    emitChange: (previousValue: any, currentValue: any) => void;
    readMode: () => void;
    editMode: () => void;
    focusHandler: () => void;
    ngAfterViewInit: () => void;
    controlSubscription: Subscription;
}

@Directive()
export class BaseControl implements IBaseControl {
    public model: any;
    public field: UniFieldLayout;
    public controlSubscription: Subscription;

    public readyEvent: EventEmitter<any> = new EventEmitter<any>(true);
    public changeEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();
    public focusEvent: EventEmitter<any> = new EventEmitter<any>(true);
    public inputEvent: EventEmitter<any> = new EventEmitter<any>();
    public messages: {};
    public control: FormControl = new FormControl();

    public readOnly$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public createControl(initialValue?: any) {
        const value = get(this.model, this.field.Property);
        let template;
        let item;
        if (!initialValue && this.field.Options && this.field.Options.source) {
            if (Array.isArray(this.field.Options.source)) {
                item = this.field.Options.source.find((x) => {
                    return get(x, this.field.Options.valueProperty) === value;
                });
            }
        }
        if (this.field.Options && this.field.Options.template && item) {
            template = this.field.Options.template(item);
            if (template === 'null') {
                template = '';
            }
        }
        let control;
        if (template !== null && template !== undefined) {
            control = new FormControl(template);
        } else if (initialValue !== null && initialValue !== undefined) {
            control = new FormControl(initialValue);
        } else {
            control = new FormControl(value);
        }
        this.control = control;
        this.readOnly$.next(this.field.ReadOnly);
    }

    public emitChange(previousValue, currentValue) {
        const changeValue = new SimpleChange(previousValue, currentValue, false);
        const property = this.field.Property;
        const change = {};
        change[property] = changeValue;
        this.changeEvent.emit(change);
    }

    public emitInstantChange(previousValue, currentValue, valid?) {
        const changeValue = new SimpleChange(previousValue, currentValue, false);
        changeValue['valid'] = valid;
        const property = this.field.Property;
        const change = {};
        change[property] = changeValue;
        this.inputEvent.emit(change);
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.readOnly$.next(true);
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.readOnly$.next(false);
    }

    public focusHandler() {
        this.focusEvent.emit(this);
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
    }

    public ngOnDestroy() {
        this.readOnly$.complete();
    }
}
