import {
    Component,
    Input,
    Output,
    ElementRef,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    SimpleChanges,
    OnInit,
    AfterViewInit,
    OnChanges
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniFieldLayout} from '../interfaces';
import {BaseControl} from './baseControl';
import * as lodash from 'lodash';

type eventListenerRemover = () => void;

@Component({
    selector: 'uni-search-wrapper',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <uni-search
            [config]="field.Options.uniSearchConfig"
            (changeEvent)="onChange($event)"
        ></uni-search>
        <ng-content></ng-content>
    `
})
export class UniSearchWrapper extends BaseControl implements OnInit, AfterViewInit, OnChanges {


    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: FormControl;

    @Input()
    public asideGuid: string;

    @Output()
    public readyEvent: EventEmitter<UniSearchWrapper> = new EventEmitter<UniSearchWrapper>(true);

    @Output()
    public changeEvent: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    public focusEvent: EventEmitter<UniSearchWrapper> = new EventEmitter<UniSearchWrapper>(true);

    @Output()
    public inputEvent: EventEmitter<SimpleChanges> = new EventEmitter<SimpleChanges>();

    private previousModelValue: any;
    private currentModelValue: any;
    private input: HTMLInputElement;
    private eventRemovers: [eventListenerRemover] = <[eventListenerRemover]>[];

    constructor(
        private cd: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        super();
    }

    public ngOnInit() {
        if (!this.field.Options || !this.field.Options.uniSearchConfig) {
            throw new Error('Tried to initialize the UniSearch field without setting Options.uniSearchConfig')
        }
    }

    public ngAfterViewInit() {
        this.input = this.elementRef.nativeElement.querySelector('input');
        this.eventRemovers.push(
            this.addEvent(this.input, 'focus', () => this.focusEvent.emit(this)),
            this.addEvent(this.input, 'blur', () => {})
        );

        this.readyEvent.emit(this);
    }

    private addEvent(element: HTMLElement, eventName: string, fn: ()=>void): eventListenerRemover {
        element.addEventListener(eventName, fn);
        return () => element.removeEventListener(eventName, fn);
    }

    public ngOnChanges(change: SimpleChanges) {
        if (change['model'] && this.field.Options && this.field.Options.uniSearchConfig) {
            const value = lodash.get(this.model, this.field.Property);
            if (this.asideGuid) {
                this.field.Options.uniSearchConfig.asideGuid = this.asideGuid;
            }
            if (this.model) {
                if (typeof this.field.Options.source === 'string') {
                    this.previousModelValue = lodash.get(this.model, this.field.Options.source);
                    this.field.Options.uniSearchConfig.initialItem$.next(this.previousModelValue);
                } else if (typeof this.field.Options.source === 'function') {
                    this.field.Options.source(this.model).subscribe(source => {
                        this.previousModelValue = source;
                        this.field.Options.uniSearchConfig.initialItem$.next(source);
                    });
                } else if (value && this.field.Property.endsWith('ID')) {
                    this.field.Options.uniSearchConfig.expandOrCreateFn({ID: value})
                        .subscribe(expandedModel => {
                            this.field.Options.uniSearchConfig.initialItem$.next(expandedModel);
                            this.previousModelValue = this.field.Options.valueProperty
                                ? lodash.get(expandedModel, this.field.Options.valueProperty)
                                : expandedModel;
                        });
                } else {
                    this.field.Options.uniSearchConfig.initialItem$.next(value);
                    this.previousModelValue = value;
                }
            }
        }
    }

    public onChange(change: any) {
        this.previousModelValue = this.currentModelValue;
        this.currentModelValue = this.field.Options.valueProperty
            ? lodash.get(change, this.field.Options.valueProperty)
            : change;
        lodash.set(this.model, this.field.Property, this.currentModelValue);
        this.emitChange(this.previousModelValue, this.currentModelValue);
        this.emitInstantChange(this.previousModelValue, this.currentModelValue);
    }

    public focus() {
        this.input.focus();
        this.input.select();
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    public ngOnDestroy() {
        this.eventRemovers.forEach(eventRemover => eventRemover());
    }
}
