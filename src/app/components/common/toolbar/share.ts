import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {IShareAction} from './toolbar';
import {ErrorService} from '../../../services/services';

@Component({
    selector: 'uni-toolbar-share',
    template: `
        <ng-template [ngIf]="shareActions?.length">
            <button class="toolbar-share" type="button"
                title="Deling/utskrift/sending"
                [attr.aria-busy]="busy"
                (click)="expanded = !expanded"
                (clickOutside)="expanded = false">

                Del
            </button>

            <ul class="toolbar-dropdown-list" [attr.aria-expanded]="expanded">
                <li *ngFor="let action of shareActions"
                    (click)="onActionClick(action)"
                    [attr.aria-disabled]="action.disabled()">

                    {{action.label}}
                </li>
            </ul>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniToolbarShare {
    @Input() public shareActions: IShareAction[];

    public expanded: boolean;
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
            (res) => {},
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
