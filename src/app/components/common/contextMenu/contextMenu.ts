import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {IContextMenuItem} from '../toolbar/toolbar';
import {ErrorService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
    selector: 'uni-context-menu',
    template: `
    <section *ngIf="filteredActions?.length">
        <button #toggle
            [attr.aria-busy]="loading$ | async"
            type="button"
            class="icon-button toggle-button">

            <i class="material-icons">more_horiz</i>
        </button>

        <dropdown-menu [trigger]="toggle" [alignRight]="true" [minWidth]="'12rem'">
            <ng-template>
                <section class="dropdown-menu-item"
                    *ngFor="let action of filteredActions"
                    (click)="runAction(action)"
                    [attr.aria-disabled]="isActionDisabled(action)">

                    {{action.label | translate}}
                </section>
            </ng-template>
        </dropdown-menu>
    </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenu {
    @Input() actions: IContextMenuItem[];
    @Input() hideDisabled: boolean;

    filteredActions: IContextMenuItem[];
    loading$ = new BehaviorSubject(false);

    constructor(private errorService: ErrorService) {}

    ngOnChanges() {
        if (this.actions && this.actions.length) {
            this.filteredActions = this.hideDisabled
                ? this.actions.filter(action => !action.disabled || !action.disabled())
                : this.actions;
        }
    }

    ngOnDestroy() {
        this.loading$.complete();
    }

    private isActionDisabled(action: IContextMenuItem) {
        return action.disabled && action.disabled();
    }

    public runAction(action: IContextMenuItem) {
        if (this.isActionDisabled(action)) {
            return;
        }

        const res = action.action();
        if (res && res.subscribe) {
            this.loading$.next(true);
            res.pipe(take(1)).subscribe(
                () => this.loading$.next(false),
                (err) => {
                    this.errorService.handle(err);
                    this.loading$.next(false);
                },
                () => this.loading$.next(false)
            );
        }
    }
}
