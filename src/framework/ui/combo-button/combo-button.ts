import {NgModule, Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DropdownMenuModule} from '../dropdown-menu/dropdown-menu';

export interface ComboButtonAction {
    label: string;
    action: () => void;
    disabled?: boolean;
}

@Component({
    selector: 'combo-button',
    styleUrls: ['./combo-button.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container *ngIf="action">
            <button (click)="action.action()"
                [ngClass]="buttonClass"
                [disabled]="action.disabled"
                [attr.aria-busy]="busy">

                {{action.label}}
            </button>

            <button #toggle [ngClass]="buttonClass" class="toggle">
                <i class="material-icons">expand_more</i>
            </button>

            <dropdown-menu [trigger]="toggle" [alignRight]="true" [minWidth]="menuMinWidth">
                <ng-template>
                    <a class="dropdown-menu-item"
                        *ngFor="let action of actions"
                        (click)="action.action()"
                        [attr.aria-disabled]="action.disabled || busy">

                        {{action.label}}
                    </a>
                </ng-template>
            </dropdown-menu>
        </ng-container>
    `
})
export class ComboButton {
    @Input() actions: ComboButtonAction[];
    @Input() mainAction: ComboButtonAction;
    @Input() buttonClass: string = 'c2a';
    @Input() busy: boolean;
    @Input() menuMinWidth: string | number;

    action: ComboButtonAction;

    ngOnChanges() {
        this.action = this.mainAction || (this.actions && this.actions[0]);
    }
}

@NgModule({
    imports: [CommonModule, DropdownMenuModule],
    declarations: [ComboButton],
    exports: [ComboButton]
})
export class ComboButtonModule {}
