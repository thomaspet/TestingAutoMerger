import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'widget-empty-state',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./widget-empty-state.sass'],
    template: `
        <img *ngIf="!hideImage"
            [src]="imageUrl || defaultImageUrl"
            (load)="imageLoaded = true"
            (error)="hideImage = true"
            alt="Illustration indicating missing widget data"
        />

        <section *ngIf="hideImage || imageLoaded" class="description">
            <ng-content></ng-content>
        </section>
    `
})
export class WidgetEmptyState {
    @Input() imageUrl: string;
    @Input() hideImage: boolean;

    defaultImageUrl = theme.widgets?.empty_state_illustration || 'themes/empty_state.svg';
    imageLoaded = false;
}
