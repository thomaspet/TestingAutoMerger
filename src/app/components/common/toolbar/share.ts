import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IContextMenuItem} from './toolbar';
import {ErrorService} from '@app/services/services';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'uni-toolbar-share',
    template: `
        <ng-container *ngIf="shareActions?.length">
            <button #toggle
                class="icon-button share-button"
                type="button"
                [attr.aria-busy]="busy">

                <i class="material-icons">share</i>
            </button>

            <dropdown-menu [trigger]="toggle" [alignRight]="true">
                <ng-template>
                    <a class="dropdown-menu-item"
                        *ngFor="let action of shareActions"
                        (click)="onActionClick(action)"
                        [attr.aria-disabled]="action.disabled()">
                        {{action.label}}
                    </a>
                </ng-template>
            </dropdown-menu>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarShare {
    @Input() shareActions: IContextMenuItem[];

    busy: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService
    ) {}

    public onActionClick(shareAction: IContextMenuItem) {
        if (this.busy || (!!shareAction.disabled && shareAction.disabled())) {
            return;
        }

        this.busy = true;
        const result = shareAction.action();

        if (result && result.subscribe) {
            result.pipe(
                finalize(() => {
                    this.busy = false;
                    this.cdr.markForCheck();
                })
            ).subscribe(
                () => {},
                (err) => this.errorService.handle(err)
            );
        }
    }
}
