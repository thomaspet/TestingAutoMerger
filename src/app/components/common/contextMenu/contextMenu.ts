import {Component, Input} from '@angular/core';
import {IContextMenuItem} from 'unitable-ng2/main';
import {GuidService} from '../../../../app/services/common/guidService';
import {ClickOutsideDirective} from '../../../../framework/core/clickOutside';

@Component({
    selector: 'uni-context-menu',
    template: `
    <span (clickOutside)="close()" *ngIf="actions && actions.length">
        <button type="button"
            class="contextmenu_button"
            [id]="guid + '-btn'"
            (click)="expanded = !expanded"
            [attr.aria-pressed]="expanded">
            Flere valg for valgt entitet
        </button>

        <ul role="menu"
            class="contextmenu_menu"
            [attr.aria-labelledby]="guid + '-btn'"
            [attr.aria-expanded]="expanded">
            <li *ngFor="let action of actions"
                class="contextmenu_item"
                (click)="runAction(action)"
                role="menuitem"
                [attr.aria-disabled]="action.disabled"
                [title]="action.label">
                {{action.label}}
            </li>
        </ul>
    </span>
    `,
    directives: [ClickOutsideDirective]
})
export class ContextMenu {

    @Input() public actions: IContextMenuItem[];

    private expanded: boolean;
    private guid: string;

    constructor(gs: GuidService) {
        this.guid = gs.guid();
    }

    private runAction(action) {
        this.close();
        action.action();
    }

    private close() {
        this.expanded = false;
    }
}
