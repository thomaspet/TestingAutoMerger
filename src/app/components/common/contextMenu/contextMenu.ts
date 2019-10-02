import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {IContextMenuItem} from '../toolbar/toolbar';
import {ErrorService} from '@app/services/services';
import {BehaviorSubject} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
    selector: 'uni-context-menu',
    template: `
    <section *ngIf="actions && actions.length">
        <button #toggle
            [attr.aria-busy]="loading$ | async"
            type="button"
            class="icon-button toggle-button">

            <i class="material-icons">more_horiz</i>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenu {
    @Input() actions: IContextMenuItem[];
    loading$ = new BehaviorSubject(false);

    constructor(private errorService: ErrorService) {}

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
                    console.log('err handler');
                    this.errorService.handle(err);
                    this.loading$.next(false);
                },
                () => this.loading$.next(false)
            );
        }
    }
}
