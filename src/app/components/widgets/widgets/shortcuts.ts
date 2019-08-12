import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import {take} from 'rxjs/operators';

interface IWidgetShortcut {
    label: string;
    url: string;
    icon: string;
    letterIcon: string;
    hasPermission: boolean;
}

@Component({
    selector: 'uni-shortcuts',
    template: `
        <section class="uni-widget-button"
            *ngFor="let shortcut of shortcuts"
            (click)="onShortcutClick(shortcut)"
            [ngClass]="{'not-allowed': !shortcut.hasPermission}">

            <i *ngIf="shortcut.letterIcon" class="letter-icon">{{shortcut.letterIcon}}</i>
            <i *ngIf="shortcut.icon" class="material-icons">{{shortcut.icon}}</i>

            <span>{{shortcut.label}}</span>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniShortcutWidget {
    public widget: IUniWidget;
    public shortcuts: IWidgetShortcut[];

    constructor(
        private router: Router,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        this.authService.authentication$.pipe(take(1)).subscribe(auth => {
            const user = auth.user;
            try {
                this.shortcuts = this.widget.config.shortcuts.map(shortcut => {
                    shortcut.hasPermission = this.authService.canActivateRoute(
                        user,
                        shortcut.url
                    );

                    return shortcut;
                });
            } catch (e) {
                console.error(e);
            }

            this.cdr.markForCheck();
        });
    }

    public onShortcutClick(shortcut: IWidgetShortcut) {
        if (shortcut.hasPermission && !this.widget._editMode) {
            this.router.navigateByUrl(shortcut.url);
        }
    }
}
