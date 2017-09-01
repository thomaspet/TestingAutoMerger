import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {UserService} from '../../../services/services';

@Component({
    selector: 'uni-shortcut',
    template: `
        <div [ngClass]="widget.config.class"
             [attr.disabled]="disabled"
             class="uni-widget-shortcut-tile uni-widget-tile-content"
             (click)="onClickNavigate()">

            <a *ngIf="widget?.config?.icon" [ngClass]="getIconClass()"></a><br />
            <a class="uni-shortcut-link">{{ widget.config.label }}</a>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniShortcutWidget {
    public widget: IUniWidget;
    private disabled: boolean;

    constructor(
        private router: Router,
        private userService: UserService,
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
            this.userService.canActivateUrl(this.widget.config.link).subscribe(canActivate => {
                this.disabled = !canActivate;
                this.cdr.detectChanges();
            });
        }
    }

    public getIconClass() {
        return 'dashboard-shortcut-icon dashboard-shortcut-icon-' + this.widget.config.icon;
    }
}
