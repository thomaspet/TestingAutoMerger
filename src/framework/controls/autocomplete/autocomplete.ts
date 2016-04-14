import {Component, Input, ElementRef, EventEmitter} from "angular2/core";
import {Control} from "angular2/common";
import {Observable} from "rxjs/Observable";
import {UniFieldBuilder} from "../../forms/builders/uniFieldBuilder";
import {BizHttp} from "../../core/http/BizHttp";
import {Employee} from "../../../app/unientities";
import guid = kendo.guid;

declare var jQuery, _;

export class UniAutocompleteConfig {
    public source: BizHttp<any>|any[];
    public valueKey: string;
    public template: (obj:any) => string;
    public minLength: number;
    public debounceTime: number;
    public search: (query:string) => Observable<any>;

    public static build(obj:any) {
        return _.assign(new UniAutocompleteConfig(),obj);
    }

    constructor(){}
}

@Component({
    selector: 'uni-autocomplete',
    templateUrl: 'framework/controls/autocomplete/autocomplete.html'
})
export class UniAutocomplete {

    public value: any;

    @Input()
    public config: UniFieldBuilder;

    public change$: EventEmitter<any> = new EventEmitter<any>(true);

    // State vars
    private options: any;
    private control: Control;
    private lastValue: any;
    private source: BizHttp<any>|Array<any>;
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
            if(event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

    }

    public refresh(value: any) {
        this.control.updateValue(value, {});
    }

    public setFocus() {
        jQuery(this.el.nativeElement).focus();
        return this;
    }

    public ngAfterViewInit() {
        var self = this;
        this.options = this.config.kOptions;
        this.control = this.config.control;
        this.source = this.options.source;
        this.config.fieldComponent = this;
        var minLength = this.options.minLength || 0;

        //Select item first time to init autocomplete values
        //That means initial value should be in the result
        //Values that are not in the source are not allowed
        this.search(_.get(this.config.model,this.options.valueKey))
            .toPromise()
            .then((x) => {
                if(x && x[0]){
                    this.selected = x[0];
                    self.choose(x[0]);
                }
            });

        //Listen for changes in the input
        this.control.valueChanges
            .debounceTime(this.options.debounceTime || 0)
            .distinctUntilChanged()
            .filter(x => {
                return x !== undefined
            })
            .filter((x:string) => {
                return x.length >= minLength
            })
            .filter((x:string) => {
                return self.lastValue !== x
            })
            .subscribe((value) => self.searchHandler(value));

        this.config.ready.emit(this);
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
            let containsString = (str: Employee) => this.options.template(str).toLowerCase().indexOf(query.toLowerCase()) >= 0;
            return Observable.fromArray((<Array<any>>this.source).filter(containsString))
        }
        var filter = /^\d+$/.test(query) ? 'startswith' : 'contains';
        return (<BizHttp<any>>this.source)
            .GetAll(`filter=${filter}(${this.options.valueKey},'${query}')`);
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
                    if(result.length > 0) {
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
            this.query = _.get(item, this.options.valueKey);
            this.value = _.get(item, this.options.valueKey);
        } else {
            this.query = '';
            this.value = undefined;
        }
        this.lastValue = this.value;
        this.control.updateValue(this.value, {});
        this.change$.emit(item);
    }

    private template(obj: any) {
        if (!this.options.template) {
            return _.get(obj,this.options.valueKey);
        } else {
            return this.options.template(obj);
        }
    }
}

