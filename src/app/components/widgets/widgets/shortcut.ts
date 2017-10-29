import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';

@Component({
    selector: 'uni-shortcut',
    template: `
        <div [ngClass]="widget.config.class"
             [attr.disabled]="disabled"
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

                {{ widget.config.label }}
            </a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniShortcutWidget {
    public widget: IUniWidget;
    private disabled: boolean;

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

    public ngAfterViewInit() {
        if (this.widget && this.widget.config && this.widget.config.link) {
            this.authService.authentication$
                .asObservable()
                .take(1)
                .subscribe(auth => {
                    this.disabled = !this.authService.canActivateRoute(
                        auth.user,
                        this.widget.config.link
                    );

                    this.cdr.markForCheck();
                });
        }
    }
}
