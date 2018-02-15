import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';

@Component({
    selector: 'uni-shortcut',
    template: `
        <div [ngClass]="widget.config.class"
             class="uni-widget-shortcut-tile uni-widget-tile-content"
             (click)="onClickNavigate()">

            <a *ngIf="widget?.config?.icon"
                class="dashboard-shortcut-icon"
                [ngClass]="'dashboard-shortcut-icon-' + widget.config.icon">
            </a><br>
            <a *ngIf="widget?.config?.letterForIcon" [ngClass]="widget?.config?.letterIconClass">
                {{ widget?.config?.letterForIcon }}
            </a>
            <a class="uni-shortcut-link"
                [ngClass]="{ 'letterForIconStyling' : widget?.config?.letterForIcon }">

                {{ widget.description }}
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniShortcutWidget {
    public widget: IUniWidget;

    constructor(
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    public onClickNavigate() {
        if (!this.widget._editMode) {
            if (this.widget.config.link) {
                this.router.navigateByUrl(this.widget.config.link);
            } else if (this.widget.config.method) {
                this.widget.config.method();
            }
        }
    }
}
