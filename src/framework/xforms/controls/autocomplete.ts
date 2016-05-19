import {Component, Input, Output, ElementRef, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Control} from '@angular/common';
import {Observable} from 'rxjs/Observable';
import {BizHttp} from '../../core/http/BizHttp';
import {UniFieldLayout} from '../unifieldlayout';


declare var _, jQuery; // jquery and lodash
var guid = kendo.guid;

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="autocomplete">
            <input
                #query
                class="autocomplete_input"
                role="combobox"
                aria-autocomplete="inline"
                [attr.aria-owns]="'results-'+guid"
                (blur)="choose(selected)"

                *ngIf="control"
                [ngFormControl]="control"
                [readonly]="field?.ReadOnly"
                [placeholder]="field?.Placeholder || ''"
            />

            <ul class="autocomplete_results"
                [id]="'results-' + guid"
                role="listbox"
                tabindex="-1"
                [attr.aria-expanded]="isExpanded">

                <li *ngFor="let result of results"
                    class="autocomplete_result"
                    role="option"
                    (mouseover)="selected = result"
                    (click)="choose(result)"
                    [attr.aria-selected]="selected === result">
                    {{template(result)}}
                </li>

            </ul>
        </div>
    `
})
export class UniAutocompleteInput {
    @Input()
    public field: UniFieldLayout;

    @Input()
    public model: any;

    @Input()
    public control: Control;

    @Output()
    public onReady: EventEmitter<UniAutocompleteInput> = new EventEmitter<UniAutocompleteInput>(true);
    
    @Output()
    public onChange: EventEmitter<any> = new EventEmitter<any>(true);
    
    // State vars
    private guid: string;
    private options: any;
    private source: BizHttp<any>|Array<any>;
    private lastValue: any;
    private isExpanded: boolean = false;
    private selected: any;
    private results: any[];
    private query: string;
    private value: string;
    
    constructor(public el: ElementRef, private cd: ChangeDetectorRef) {
        // Set a guid to use in DOM IDs etc.
        this.guid = guid();

        // Add event listeners for dismissing the dropdown
        let $el = jQuery(el.nativeElement);
        document.addEventListener('click', (event) => {
            if (!jQuery(event.target).closest($el).length) {
                event.stopPropagation();
                this.isExpanded = false;
            }
        });
        document.addEventListener('keyup', (event) => {
            // Escape to dismiss
            if (event.keyCode === 27) {
                this.isExpanded = false;
            }
        });

        // And for navigating within the dropdown
        el.nativeElement.addEventListener('keyup', (event) => {
            if (event.keyCode === 38) {
                // Arrow up
                this.moveSelection(-1);
            } else if (event.keyCode === 40) {
                // Arrow down
                this.moveSelection(1);
            } else if (event.keyCode === 13 ||
                event.keyCode === 9) {
                // Enter or tab
                this.choose(this.selected);
            }
        });

        el.nativeElement.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

    }

    public focus() {
        jQuery(this.el.nativeElement).find('input').first().focus();
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
        if (changes['model']) {
            this.options = this.field.Options || {};
            this.source = this.options.source;
            var self = this;

            // Select item first time to init autocomplete values
            // That means initial value should be in the result
            // Values that are not in the source are not allowed
            
            this.search(_.get(this.model, this.options.valueKey))
                .toPromise()
                .then((x) => {
                    if (x && x[0]) {
                        this.selected = x[0];
                        self.choose(x[0]);
                    }
                });

            // Listen for changes in the input
            this.control.valueChanges
                .debounceTime(this.options.debounceTime || 0)
                .distinctUntilChanged()
                .filter(x => {
                    return x !== undefined;
                })
                .filter((x: string) => {
                    return x.length >= (self.options.minLength || 0);
                })
                .filter((x: string) => {
                    return self.lastValue !== x;
                })
                .subscribe((value) => self.searchHandler(value));
            }
    }
    
    public ngAfterViewInit() {
        this.onReady.emit(this);
    }

    // Replace this with the call to server
    private search(query: string) {
        if (this.options.search) {
            return this.options.search(query);    
        }
        return this._search(query);
        
    }
    private _search(query: string) {
        if (this.source.constructor === Array) {
            if (!query) {
                return Observable.from(<any[]>this.source);
            }
            let containsString = (obj: any) => {
                var template = this.template(obj);
                return template.toLowerCase().indexOf(query.toLowerCase()) >= 0;
            };
            return Observable.from((<Array<any>>this.source).filter(containsString));
        }
        var filter = /^\d+$/.test(query) ? 'startswith' : 'contains';
        return (<BizHttp<any>>this.source).GetAll(`filter=${filter}(${this.options.valueKey},'${query}')`);
    }

    // The UI handler for searching
    private searchHandler(query: any) {
        var self = this;
        this.results = [];

        // Clean up if the search is cleared out
        if (!query && query !== '') {
            this.isExpanded = false;
            this.selected = undefined;
            this.cd.markForCheck();
            return;
        }

        // Kick off the search function
        this.search(query).subscribe(
            (result) => {
                if (result.constructor === Array) {
                    if (result.length > 0) {
                        self.selected = result[0];
                    }
                    self.results = result;
                } else {
                    self.selected = result;
                    self.results.push(result);
                }
                self.isExpanded = true;
                this.cd.markForCheck();
            },
            (err) => {
                console.error(err);
            }
        );
    }

    // Keyboard navigation within list
    private moveSelection(moveBy) {
        // If we have no results to traverse, return out
        if (!this.results) {
            return;
        }

        // If we have no current selection
        if (!this.selected && moveBy >= 0) {
            // If we move down without a selection, start at the top
            return this.selected = this.results[0];
        } else if (!this.selected && moveBy < 0) {
            // If we move up without a selection, start at the bottom
            return this.selected = this.results[this.results.length - 1];
        }

        // If we have a selection already
        let currentIndex = this.results.indexOf(this.selected);

        if (currentIndex < 0 ||
            currentIndex + moveBy >= this.results.length) {
            // If the selected result is no longer a result, or if we wrap around,
            // then we go to the first item
            this.selected = this.results[0];
        } else if (currentIndex + moveBy < 0) {
            // Wrap around the other way
            this.selected = this.results[this.results.length - 1];
        } else {
            this.selected = this.results[currentIndex + moveBy];
        }
    }

    // Make a selection
    private choose(item) {
        this.isExpanded = false;

        if (item) {
            this.query = _.get(item, this.field.Options.displayProperty);
            this.value = _.get(item, this.field.Options.valueProperty);
        } else {
            this.query = '';
            this.value = undefined;
        }
        this.lastValue = this.value;
        this.control.updateValue(this.query, {});
        if (_.get(this.model, this.field.Property) === this.value) {
            return;
        }
        _.set(this.model, this.field.Property, this.value);
        this.onChange.emit(this.model);
    }

    private template(obj: any) {
        if (!this.field.Options.template) {
            return _.get(obj, this.options.valueKey);
        } else {
            return this.options.template(obj);
        }
    }
}