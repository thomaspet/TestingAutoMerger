import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import * as _ from 'lodash';

export interface IMultiLevelSelectItem {
    label: string;
    items: any[];
}

@Component({
    selector: 'uni-multilevel-select',
    templateUrl: './multiLevelSelect.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniMultiLevelSelect {
    @Input()
    public placeholder: string;

    @Input()
    public items: any[] | IMultiLevelSelectItem[];

    @Input()
    public displayField: string;

    @Output()
    public select: EventEmitter<any> = new EventEmitter();

    private isExpanded: boolean;

    public getDisplayValue = _.memoize(item => {
        if (item.label) {
            return item.label;
        } else {
            return _.get(item, this.displayField);
        }
    });

    public toggle() {
        this.isExpanded = !this.isExpanded;
    }

    public close() {
        this.isExpanded = false;
    }

    public onItemClick(item: IMultiLevelSelectItem) {
        if (item.items) {
            return;
        }

        this.select.next(item);
        this.close();
    }
}
