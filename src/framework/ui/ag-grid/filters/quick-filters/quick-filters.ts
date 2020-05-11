import {Component, Input, Output, EventEmitter} from '@angular/core';
import {QuickFilter} from '@uni-framework/ui/unitable';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
    selector: 'quick-filters',
    templateUrl: './quick-filters.html',
    styleUrls: ['./quick-filters.sass']
})
export class QuickFilters {
    @Input() quickFilters: QuickFilter[];
    @Output() quickFiltersChange = new EventEmitter<QuickFilter[]>();

    changeEventDebouncer$ = new Subject();

    constructor() {
        this.changeEventDebouncer$.pipe(
            debounceTime(250)
        ).subscribe(() => {
            this.quickFiltersChange.emit(this.quickFilters);
        });
    }

    ngOnDestroy() {
        this.changeEventDebouncer$.complete();
    }
}

