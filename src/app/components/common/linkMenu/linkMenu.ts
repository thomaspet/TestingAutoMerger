import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { ValidationLevel } from '../../../unientities';

export interface ILinkMenuItem {
    title?: string;
    validation?: ValidationLevel;
    link: string;
    label: string;
}

@Component({
    selector: 'link-menu',
    templateUrl: './linkMenu.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkMenu implements OnInit, OnChanges {
    @Input() private menu: ILinkMenuItem[];
    constructor() { }

    public ngOnInit() { }
    public ngOnChanges(changes) {
        if (this.menu) {
            this.menu.map(x => {
                if (!x.link.startsWith('#')) {
                    x.link = '#' + x.link;
                }
                if (!x.title) {
                    x.title = '';
                }
            });
        }
    }
}
