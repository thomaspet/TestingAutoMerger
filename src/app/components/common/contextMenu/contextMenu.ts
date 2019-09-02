import {Component, Input} from '@angular/core';
import {IContextMenuItem} from '@uni-framework/ui/unitable/index';

@Component({
    selector: 'uni-context-menu',
    template: `
    <section *ngIf="actions && actions.length">
        <button #toggle type="button" class="contextmenu_button">
            Flere valg for valgt entitet
        </button>

        <dropdown-menu [trigger]="toggle" [alignRight]="true" [minWidth]="'12rem'">
            <ng-template>
                <section class="dropdown-menu-item"
                    *ngFor="let action of actions"
                    (click)="runAction(action)"
                    [attr.aria-disabled]="isActionDisabled(action)">

                    {{action.label}}
                </section>
            </ng-template>
        </dropdown-menu>
    </section>
    `
})
export class ContextMenu {
    @Input() actions: IContextMenuItem[];

    private isActionDisabled(action: IContextMenuItem) {
        return action.disabled && action.disabled();
    }

    public runAction(action: IContextMenuItem) {
        if (!this.isActionDisabled(action)) {
            action.action();
        }
    }
}
