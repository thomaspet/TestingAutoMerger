import {Component, Input} from '@angular/core';
import {IContextMenuItem} from '../../../../framework/ui/unitable/index';
import {GuidService} from '../../../../app/services/services';

@Component({
    selector: 'uni-context-menu',
    template: `
    <section (clickOutside)="close()" *ngIf="actions && actions.length">
        <button type="button"
            class="contextmenu_button"
            [id]="guid + '-btn'"
            (click)="expanded = !expanded"
            [attr.aria-pressed]="expanded">
            Flere valg for valgt entitet
        </button>

        <ul role="menu"
           class="toolbar-dropdown-list"
           [attr.aria-labelledby]="guid + '-btn'"
           [attr.aria-expanded]="expanded">
           <li *ngFor="let action of actions"
               (click)="runAction(action)"
               role="menuitem"
               [attr.aria-disabled]="isActionDisabled(action)"
               [title]="action.label"
               >
               {{action.label}}
           </li>
       </ul>
    </section>
    `
})
export class ContextMenu {

    @Input() public actions: IContextMenuItem[];

    private expanded: boolean;
    private guid: string;

    constructor(gs: GuidService) {
        this.guid = gs.guid();
    }

    private isActionDisabled(action: IContextMenuItem) {
        return action.disabled && action.disabled();
    }

    public runAction(action: IContextMenuItem) {
       if (!this.isActionDisabled(action)) {
           this.close();
           action.action();
       }
   }

    private close() {
        this.expanded = false;
    }
}
