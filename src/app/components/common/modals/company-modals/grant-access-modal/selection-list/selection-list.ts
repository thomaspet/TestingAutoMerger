import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'grant-access-selection-list',
    templateUrl: './selection-list.html',
    styleUrls: ['./selection-list.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GrantAccessSelectionList {
    @Input() labelProperty: string;
    @Input() secondLabelProperty?: string;
    @Input() items: any[];
    @Input() busy: boolean;
    @Output() itemsChange: EventEmitter<any[]> = new EventEmitter();

    checkAll: boolean;

    filterControl: FormControl = new FormControl('');
    filteredItems: any[];

    constructor(private cdr: ChangeDetectorRef) {
        this.filterControl.valueChanges
            .debounceTime(100)
            .distinctUntilChanged()
            .subscribe(value => {
                this.filterItems(value);
                this.cdr.markForCheck();
            });
    }

    ngOnChanges() {
        this.filteredItems = this.items;
        this.cdr.markForCheck();
    }

    onCheckAllChange() {
        this.checkAll = !this.checkAll;
        this.items.forEach(item => {
            if (!item['_isMandatory']) {
                item['_selected'] = this.checkAll;
            }
        });
        this.itemsChange.emit(this.items);
    }

    onItemSelectionChange(item) {
        this.checkAll = !!item['_selected']
            ? this.items.every(i => !!i['_selected'])
            : false;

        this.cdr.markForCheck();
        this.itemsChange.emit(this.items);
    }

    private filterItems(filterText: string) {
        const filterLowerCase = filterText.toLowerCase();
        this.filteredItems = this.items.filter(item => {
            if (item[this.secondLabelProperty]) {
                return item[this.labelProperty].toLowerCase().includes(filterLowerCase)
                    || item[this.secondLabelProperty].toLowerCase().includes(filterLowerCase);
            }
            return item[this.labelProperty].toLowerCase().includes(filterLowerCase);
        });
    }
}
