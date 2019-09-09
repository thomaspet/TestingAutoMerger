import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';
import {Highlightable} from '@angular/cdk/a11y';

@Component({
    selector: 'smart-search-item',
    template: `{{item?.value || item?.name | translate}}`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSmartSearchItem implements Highlightable {
    @Input() item: any; // type me?
    @HostBinding('class.active') isActive: boolean = false;
    @HostBinding('class.header') get isHeader() {
        return this.item && this.item.type === 'header';
    }
    public type: string; // ENUM ?
    public actionValues: any[];

    setActiveStyles() {
        this.isActive = true;
    }

    setInactiveStyles() {
        this.isActive = false;
    }
}
