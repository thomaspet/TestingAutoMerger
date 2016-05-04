import {Component, Input, Output, ElementRef, EventEmitter} from 'angular2/core';
import {Control, FORM_DIRECTIVES} from 'angular2/common';
import {Observable} from 'rxjs/Observable';
import {BizHttp} from '../../core/http/BizHttp';
import {FieldLayout} from '../../../app/unientities';

var guid = kendo.guid;
declare var jQuery, _;

@Component({
    selector: 'uni-autocomplete',
    // templateUrl: 'framework/controls/autocomplete/autocomplete.html'
    directives: [FORM_DIRECTIVES],
    template: `
        <div class="autocomplete" *ngIf="control">
            <input
                class="autocomplete_input"
                role="combobox"
                aria-autocomplete="inline"
                [attr.aria-owns]="'results-'+guid"
                (blur)="choose(selected)"

                [ngFormControl]="control"
                [readonly]="field.ReadOnly"
                [hidden]="field.Hidden"
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
export class UniAutocomplete {

    @Input()
    public control: Control;

    @Input()
    public field: FieldLayout;

    @Input()
    public model: any;
    
    @Output()
    public onSelect: EventEmitter<any> = new EventEmitter<any>(true);
    
    @Output()
    public onReady: EventEmitter<any> = new EventEmitter<any>(true);

    public value: any;
    private source: BizHttp<any> | Array<any>;
    private options: any;
    private lastValue: any;
    private guid: string;
    private isExpanded: boolean = false;
    private selected: any;
    private results: any[];
    private query: string;

    constructor(public el: ElementRef) {
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

    public setFocus() {
        jQuery(this.el.nativeElement).focus();
        return this;
    }

    public ngOnChanges(changes) {
        console.log('ngOnChanges');
        if (!changes['control']) {
            return;
        }
        if (!changes['model']) {
            return;
        }
        if (!changes['field']) {
            return;
        }
        var self = this;
        this.options = this.field.Options;
        this.source = this.field.Options.source;
        
        var minLength = this.options.minLength || 0;

        // Select item first time to init autocomplete values
        // That means initial value should be in the result
        // Values that are not in the source are not allowed
        this.search(_.get(this.model, this.options.Property))
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
                return x.length >= minLength;
            })
            .filter((x: string) => {
                return self.lastValue !== x;
            })
            .subscribe((value) => self.searchHandler(value));

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
        // Data is an array
        if (this.source.constructor === Array) {
            // query is empty
            if (!query) {
                return Observable.from(<Array<any>>this.source);
            }
            // filter query
            let containsString = (obj: any) => this.template(obj).toLowerCase().indexOf(query.toLowerCase()) >= 0;
            return Observable.from((<Array<any>>this.source).filter(containsString));
        }
        // source is a http resource
        if (!query) {
            return (<BizHttp<any>>this.source).GetAll(query);    
        }
        var filter = /^\d+$/.test(query) ? 'startswith' : 'contains';
        return (<BizHttp<any>>this.source).GetAll(`filter=${filter}(${this.options.Property},'${query}')`);
    }

    // The UI handler for searching
    private searchHandler(query: any) {
        this.results = [];

        // Clean up if the search is cleared out
        if (!query) {
            this.isExpanded = false;
            this.selected = undefined;
            return;
        }

        // Kick off the search function
        this.search(query).subscribe(
            (result) => {
                if (result.constructor === Array) {
                    if (result.length > 0) {
                        this.selected = result[0]
                    }
                    this.results = result;
                } else {
                    this.selected = result;
                    this.results.push(result);
                }
                this.isExpanded = true;
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
            this.query = _.get(item, this.options.valueProperty);
            this.value = _.get(item, this.options.valueProperty);
        } else {
            this.query = '';
            this.value = undefined;
        }
        this.lastValue = this.value;
        this.control.updateValue(this.value, {});
        _.set(this.model, this.field.Property, this.value);
        this.onSelect.emit(item);
    }

    private template(obj: any) {
        if (!this.options.template) {
            return _.get(obj, this.options.valueProperty);
        } else {
            return this.options.template(obj);
        }
    }
}

