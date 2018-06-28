import {Component, Input, HostBinding, ChangeDetectionStrategy} from '@angular/core';
import {Highlightable} from '@angular/cdk/a11y';

@Component({
    selector: 'smart-search-item',
    template: `{{item?.value || item?.name}}`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniSmartSearchItem implements Highlightable {
    @Input() item: any; // type me?
    @HostBinding('class.active') isActive: boolean = false;
    @HostBinding('class.header') get isHeader() {
        return this.item && this.item.isHeader;
    }

    setActiveStyles() {
        this.isActive = true;
    }

    setInactiveStyles() {
        this.isActive = false;
    }
}
