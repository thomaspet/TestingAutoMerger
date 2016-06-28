import {Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, Renderer} from '@angular/core';
import {Control} from '@angular/common';
import {Observable} from 'rxjs/Observable';

import {BizHttp} from '../../core/http/BizHttp';
import {UniFieldLayout} from '../interfaces';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';

declare var _; // lodash


export class UniAutocompleteConfig {
    public source: BizHttp<any>|any[];
    public valueKey: string;
    public template: (obj: any) => string;
    public minLength: number;
    public debounceTime: number;
    public search: (query: string) => Observable<any>;

    public static build(obj: any) {
        return _.assign(new UniAutocompleteConfig(), obj);
    }

    constructor() { }
}

@Component({
    selector: 'uni-autocomplete-input',
    template: `
        <div class="autocomplete">
            <input #query
                *ngIf="control"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
                
                (blur)="confirmSelection()"
                (keypress)="onKeyPress()"
                (keydown)="onKeyDown($event)"
                
                class="autocomplete_input"
                role="combobox"
                aria-autocomplete="inline"
                [attr.aria-owns]="'results-'+guid"
            />

            <ul #list 
                class="autocomplete_results"
                [id]="'results-' + guid"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="isExpanded">

                <li *ngFor="let item of lookupResults; let idx = index"
                    class="autocomplete_result"
                    role="option"
                    (mouseover)="onMouseover(idx)"
                    (click)="confirmSelection()"
                    [attr.aria-selected]="selectedIndex === idx">
                    {{template(item)}}
                </li>
            </ul>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniAutocompleteInput {
    @ViewChild('list')  private list: ElementRef;
    @ViewChild('query') private inputElement: ElementRef;
    
    @Input()
    private field: UniFieldLayout;    
    
    @Input()
    private model: any;

    @Input()
    private control: Control;
    
    @Output()
    public onReady: EventEmitter<UniAutocompleteInput> = new EventEmitter<UniAutocompleteInput>(true);

    // state vars
    private guid: string;
    private options: any;
    private source: BizHttp<any> | Array<any>;
    private lastValue: any;
    private query: string;
    private value: string;

    
    private busy: boolean = false;
    private selectedIndex: any;
    private lookupResults: any[] = [];
    private isExpanded: boolean;
    private focusPositionTop: number = 0;

    constructor(private renderer: Renderer, private cd: ChangeDetectorRef) {
        this.guid = 'autocomplete-' + performance.now();
    }

    public ngOnChanges(changes) {
        if (changes['model']) {
            this.options = this.field.Options || {};
            this.source = this.options.source;
        }
        
        // Perform initial lookup to get display value
        this.getInitialDisplayValue(this.control.value)
            .subscribe(result => {
                this.control.updateValue(this.template(result[0]) || '', {emitEvent: false});
            });

        this.control.valueChanges
            .debounceTime(this.options.debounceTime || 250)
            .filter((input: string) => {
                this.lookupResults = [];
                return (this.control.dirty && input.length >= (this.options.minLength || 0));
            })
            .switchMap((input: string) => {
                this.busy = true;
                return this.search(input);
            })
            .subscribe((items: any[]) => {
                this.selectedIndex = 0;
                this.lookupResults = items;
                this.isExpanded = true;
                this.busy = false;
                this.cd.markForCheck();
            });
    }


    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    public focus() {
        this.renderer.invokeElementMethod(this.inputElement.nativeElement, 'focus', []);
    }

    public readMode() {
        this.field.ReadOnly = true;
        this.cd.markForCheck();
    }

    public editMode() {
        this.field.ReadOnly = false;
        this.cd.markForCheck();
    }

    private template(obj: any) {
        if (!this.field.Options.template) {
            return _.get(obj, this.options.displayProperty);
        } else {
            return this.options.template(obj);
        }
    }

    private getInitialDisplayValue(value): Observable<any> {
        
        if (!this.source) {
            return Observable.of([]);
        }

        if (Array.isArray(this.source)) {
            return Observable.of([(<any[]> this.source).find((item) => {
                return _.get(item, this.field.Options.valueProperty) === value;
            })]);
        } else {
            return (<BizHttp<any>> this.source).GetAll(`filter=${this.field.Options.valueProperty} eq ${value}`);
        }
    }

    private search(query: string): Observable<any> {
        if (this.options.search) {
            return this.options.search(query);
        }

        if (!this.source) {
            return Observable.of([]);
        }

        // Local search
        if (Array.isArray(this.source)) {
            let filteredResults = (<Array<any>> this.source).filter((item) => {
                return this.template(item).toLowerCase().indexOf(query.toLowerCase()) >= 0;
            });
            return Observable.of(filteredResults);
        }
        // Remote search
        else {
            const operator = /^\d+$/.test(query) ? 'startswith' : 'contains';
            return (<BizHttp<any>> this.source).GetAll(`filter=${operator}(${this.field.Options.displayProperty},'${query}')`);
        }
    }

    private confirmSelection() {
        this.isExpanded = false;
        this.cd.markForCheck();
        this.focusPositionTop = 0;
        
        if (!this.control.dirty) {
            return;
        }
                
        // Wait for response 
        // (allows us to still select result[0] when user tabs out before lookup is finished)
        if (this.busy) {
            setTimeout(() => {
                this.confirmSelection();
            }, 200);
            
            return;
        }

        if (!this.control.value || !this.lookupResults.length) {
            this.query = '';
            this.value = null;
        } else {
            let selectedItem = this.lookupResults[this.selectedIndex];
            this.query = this.template(selectedItem);
            this.value = _.get(selectedItem, this.field.Options.valueProperty);
        }

        this.control.updateValue(this.query, {emitEvent: false});

        if (this.lastValue !== this.value) {
            this.lastValue = this.value;
            _.set(this.model, this.field.Property, this.value);
            if (this.field.Options && this.field.Options.events && this.field.Options.events.select) {
                this.field.Options.events.select(this.model);
            }
        }
    }
    
    private onMouseover(index) {
        if (index < this.selectedIndex) {
            for (let i = index; i < this.selectedIndex; i++) {
                this.focusPositionTop -= this.list.nativeElement.children[i].clientHeight; 
            }
        } else if (index > this.selectedIndex) {
            for (let i = this.selectedIndex; i < index; i++) {
                this.focusPositionTop += this.list.nativeElement.children[i].clientHeight;
            }
        }
        
        this.selectedIndex = index;
    }
    
    private onKeyPress() {
        this.busy = true;
    }

    private onKeyDown(event) {        
        var prevItem = undefined;
        var currItem = undefined;
        var overflow = 0;
        
        switch (event.keyCode) {
            case 13:
                this.confirmSelection();
            break;
            case 27:
                this.control.updateValue(this.query, {emitEvent: false});
                this.isExpanded = false;
                this.cd.markForCheck();
            break;
            case 38:
                if (this.selectedIndex !== 0) {
                    this.selectedIndex--;
                    
                    currItem = this.list.nativeElement.children[this.selectedIndex];
                    if (currItem) {
                        this.focusPositionTop -= currItem.clientHeight;
                        
                        overflow = this.focusPositionTop - this.list.nativeElement.scrollTop;
                                                
                        if (overflow < 0) {
                            this.list.nativeElement.scrollTop += overflow;
                        }
                    }
                }            
                
            break;
            case 40:
                if (this.selectedIndex !== (this.lookupResults.length - 1)) {
                    this.selectedIndex++;
                    
                    prevItem = this.list.nativeElement.children[this.selectedIndex - 1];
                    currItem = this.list.nativeElement.children[this.selectedIndex];
                    
                    if (prevItem && currItem) {
                        this.focusPositionTop += prevItem.clientHeight;
                        
                        overflow = (this.focusPositionTop + currItem.clientHeight) - 
                                (this.list.nativeElement.clientHeight + this.list.nativeElement.scrollTop);
                        
                        if (overflow > 0) {
                            this.list.nativeElement.scrollTop += overflow;
                        }
                    }   
                }
            break;
        }
    }    
}
