import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

export interface IMultiLevelSelectItem {
    label: string;
    value: any | IMultiLevelSelectItem[];
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
    public items: IMultiLevelSelectItem[];

    @Output()
    public select: EventEmitter<any> = new EventEmitter();

    private isExpanded: boolean;

    public toggle() {
        this.isExpanded = !this.isExpanded;
    }

    public close() {
        this.isExpanded = false;
    }

    public onItemClick(item: IMultiLevelSelectItem) {
        if (Array.isArray(item.value)) {
            return;
        }

        this.select.next(item.value);
        this.close();
    }

    public isSublist(item: IMultiLevelSelectItem): boolean {
        return Array.isArray(item);
    }

}
