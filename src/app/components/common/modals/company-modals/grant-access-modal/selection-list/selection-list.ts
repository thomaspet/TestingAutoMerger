import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
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
    @Input() items: any[];
    @Output() itemsChange: EventEmitter<any[]> = new EventEmitter();

    checkAll: boolean;

    filterControl: FormControl = new FormControl('');
    filteredItems: any[];

    constructor() {
        this.filterControl.valueChanges
            .debounceTime(200)
            .distinctUntilChanged()
            .subscribe(value => this.filterItems(value));
    }

    ngOnChanges() {
        this.filteredItems = this.items;
    }

    onCheckAllChange() {
        this.checkAll = !this.checkAll;
        this.items.forEach(item => item['_selected'] = this.checkAll);
        this.itemsChange.emit(this.items);
    }

    onItemSelectionChange(item) {
        item['_selected'] = !item['_selected'];

        this.checkAll = !!item['_selected']
            ? this.items.every(i => !!i['_selected'])
            : false;

        this.itemsChange.emit(this.items);
    }

    private filterItems(filterText: string) {
        this.filteredItems = this.items.filter(item => {
            return item[this.labelProperty].includes(filterText);
        });
    }
}
