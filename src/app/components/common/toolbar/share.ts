import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IShareAction} from './toolbar';
import {ErrorService} from '@app/services/services';

@Component({
    selector: 'uni-toolbar-share',
    template: `
        <ng-container *ngIf="shareActions?.length">
            <button #toggle class="toolbar-share"
                type="button"
                title="Deling/utskrift/sending"
                [attr.aria-busy]="busy">

                Del
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
    @Input() shareActions: IShareAction[];

    public busy: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService
    ) {}

    public onActionClick(shareAction: IShareAction) {
        if (this.busy || (!!shareAction.disabled && shareAction.disabled())) {
            return;
        }

        this.busy = true;
        shareAction.action().subscribe(
            () => {},
            (err) => {
                this.errorService.handle(err);
            },
            () => {
                this.busy = false;
                this.cdr.markForCheck();
            }
        );
    }
}
