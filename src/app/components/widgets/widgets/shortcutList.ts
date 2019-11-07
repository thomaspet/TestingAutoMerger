import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';
import PerfectScrollbar from 'perfect-scrollbar';
import {take} from 'rxjs/operators';

@Component({
    selector: 'uni-shortcut-list',
    template: `
        <section class="widget-wrapper">
            <section class="header">
                <span>{{widget.config.header}}</span>
            </section>
            <div class="content shortcut-list">
                <ul id="shortcut-list">
                    <li *ngFor="let item of items">
                        <a (click)="navigateOnClick(item.link)" title="Gå til liste">{{ item.label | translate }} </a>
                        <a *ngIf="item.urlToNew"
                            (click)="navigateOnClick(item.urlToNew)"
                            title="Opprett ny">
                            <i class="material-icons"> add </i>
                        </a>
                    </li>
                </ul>
            </div>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniShortcutListWidget {
    widget: IUniWidget;
    items: Array<any>;
    scrollbar: PerfectScrollbar;

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {
            this.scrollbar = new PerfectScrollbar('#shortcut-list', {wheelPropagation: true});
            // Authenticate all routes/modules
            this.authService.authentication$.pipe(take(1)).subscribe(auth => {
                if (auth.user) {
                    this.checkRoutes(auth.user);
                    this.cdr.markForCheck();
                }
            });

        }
    }

    ngOnDestroy() {
        if (this.scrollbar) {
            this.scrollbar.destroy();
        }
    }

    public navigateOnClick(url: string) {
        this.router.navigateByUrl(url);
    }

    private checkRoutes(user) {
        this.items = this.widget.config.shortcuts.filter(item => {
            return this.authService.canActivateRoute(user, item.link);
        });
    }
}
