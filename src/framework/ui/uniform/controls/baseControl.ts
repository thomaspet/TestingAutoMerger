import {EventEmitter, SimpleChange, SimpleChanges} from '@angular/core';
import {UniFieldLayout} from '../interfaces';
import {MessageComposer} from '../composers/messageComposer';
import {ValidatorsComposer} from '../composers/validatorsComposer';
import {FormControl, ValidatorFn, AsyncValidatorFn} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';

declare const _;

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
        const value = _.get(this.model, this.field.Property);
        this.messages = MessageComposer.composeMessages(this.field);
        const syncvalidators: ValidatorFn = ValidatorsComposer.composeSyncValidators(this.field);
        const asyncvalidators: AsyncValidatorFn = ValidatorsComposer.composeAsyncValidators(this.field);
        let template;
        let item;
        if (!initialValue && this.field.Options && this.field.Options.source) {
            if (Array.isArray(this.field.Options.source)) {
                item = this.field.Options.source.find((x) => {
                    return _.get(x, this.field.Options.valueProperty) === value;
                });
            }
        }
        if (this.field.Options && this.field.Options.template && item) {
            template = this.field.Options.template(item);
            if (template === 'null') {
                template = '';
            }
        }
        const control = new FormControl(initialValue || template || value, syncvalidators, asyncvalidators);
        this.control = control;
        this.readOnly$.next(this.field.ReadOnly);
    }

    public emitChange(previousValue, currentValue) {
        let changeValue = new SimpleChange(previousValue, currentValue, false);
        let property = this.field.Property;
        let change = {};
        change[property] = changeValue;
        this.changeEvent.emit(change);
    }

    public emitInstantChange(previousValue, currentValue, valid?) {
        let changeValue = new SimpleChange(previousValue, currentValue, false);
        changeValue['valid'] = valid;
        let property = this.field.Property;
        let change = {};
        change[property] = changeValue;
        this.inputEvent.emit(change);
    }

    public readMode() {
        this.readOnly$.next(true);
    }

    public editMode() {
        this.readOnly$.next(false);
    }

    public focusHandler() {
        this.focusEvent.emit(this);
    }

    public ngAfterViewInit() {
        this.readyEvent.emit(this);
    }
}