import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    SimpleChanges,
    HostListener
} from '@angular/core';

import {FormControl} from '@angular/forms';
import {Observable, Subscription, of as observableOf} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {get, set} from 'lodash';

import {BaseControl} from '../baseControl';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces';
import {KeyCodes} from '@app/services/common/keyCodes';

@Component({
    selector: 'uni-typeahead-input',
    templateUrl: './typeahead.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UniTypeaheadInput extends BaseControl {
    @ViewChild('dropdown') private dropdown: ElementRef;
    @ViewChild('inputElement') private inputElement: ElementRef;

    @Input() field: UniFieldLayout;
    @Input() model: any;
    @Input() asideGuid: string;

    @Output() readyEvent = new EventEmitter<UniTypeaheadInput>(true);
    @Output() changeEvent = new EventEmitter<SimpleChanges>();
    @Output() inputEvent = new EventEmitter<SimpleChanges>();
    @Output() focusEvent = new EventEmitter<UniTypeaheadInput>(true);

    private options: any;
    private source: any[];

    isExpanded = false;
    selectedIndex = -1;
    lookupResults = [];

    inputSubscription: Subscription;

    constructor(private cd: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        this.control = new FormControl('');
        this.inputSubscription = this.control.valueChanges.pipe(
            debounceTime(200)
        ).subscribe(value => {
            this.search(value).subscribe(items => {
                this.lookupResults = items || [];
                if (items.length) {
                    if (value) {
                        this.selectedIndex = 0;
                    }

                    this.isExpanded = true;
                } else {
                    this.selectedIndex = -1;
                    this.isExpanded = false;
                }

                this.cd.markForCheck();
            });
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.inputSubscription.unsubscribe();
    }

    ngOnChanges(changes) {
        if (changes['field']) {
            this.readOnly$.next(this.field && this.field.ReadOnly);
        }

        if (changes['model']) {
            this.options = this.field.Options || {};
            this.source = this.options.source || [];
        }

        if (this.field && this.model && changes['model'] || changes['field']) {
            const value = get(this.model, this.field.Property);
            this.control.setValue(value, { emitEvent: false });
        }
    }

    focus() {
        try {
            this.inputElement.nativeElement.focus();
            this.inputElement.nativeElement.select();
        } catch (e) {}
    }

    blur() {
        try {
            this.inputElement.nativeElement.blur();
        } catch (e) {}
    }

    emitChanges() {
        const modelValue = get(this.model, this.field.Property);
        const inputValue = this.control.value;

        if (inputValue !== modelValue) {
            set(this.model, this.field.Property, inputValue);

            this.emitChange(modelValue, inputValue);
            this.emitInstantChange(modelValue, inputValue, true);
        }
    }

    toggle() {
        if (this.isExpanded) {
            this.isExpanded = false;
        } else {
            this.lookupResults = this.source;
            this.selectedIndex = -1;
            this.isExpanded = true;
        }

        this.cd.markForCheck();
    }

    onClickOutside() {
        if (this.isExpanded) {
            this.isExpanded = false;
            this.cd.markForCheck();
        }
    }

    private template(item) {
        if (this.options.template) {
            return this.options.template(item) || '';
        } else {
            return get(item, this.options.displayProperty || this.options.valueProperty, '');
        }
    }

    private search(query: string): Observable<any[]> {
        if (this.options.search) {
            return this.options.search(query);
        }

        if (this.source && Array.isArray(this.source)) {
            let filteredResults;
            if (query) {
                filteredResults = this.source.filter((item) => {
                    return this.template(item).toLowerCase().includes(query.toLowerCase());
                });
            } else {
                filteredResults = this.source;
            }

            return Observable.of(filteredResults.slice(0, 50));
        }

        return observableOf([]);
    }

    private select(index: number = this.selectedIndex) {
        if (this.lookupResults && this.lookupResults[index]) {
            const item = this.lookupResults[index];
            const value = get(item, this.options.valueProperty);
            this.control.setValue(value, { emitEvent: false });
            this.emitChanges();
        }

        this.isExpanded = false;
        this.cd.markForCheck();
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case KeyCodes.TAB:
            case KeyCodes.ENTER:
                this.select();
            break;
            case KeyCodes.ESCAPE:
                this.isExpanded = false;
                this.selectedIndex = -1;
            break;
            case KeyCodes.SPACE:
                if (!this.isExpanded && !this.control.value) {
                    event.preventDefault();
                    this.toggle();
                }
            break;
            case KeyCodes.UP_ARROW:
                event.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectedIndex--;
                    this.scrollToListItem();
                }
            break;
            case KeyCodes.DOWN_ARROW:
                event.preventDefault();
                if (event.altKey && !this.isExpanded) {
                    this.isExpanded = true;
                } else {
                    if (this.selectedIndex < this.lookupResults.length - 1) {
                        this.selectedIndex++;
                        this.scrollToListItem();
                    }
                }
            break;
            case KeyCodes.F4:
                this.toggle();
            break;
        }

        this.cd.markForCheck();
    }

    private scrollToListItem() {
        if (this.dropdown && this.dropdown.nativeElement) {
            const list = this.dropdown.nativeElement;
            const item = list.children[this.selectedIndex];
            if (item) {
                item.scrollIntoView(false);
            }
        }
    }
}
