import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';

@Component({
    selector: 'uni-shortcut-list',
    template: `
        <section class="uni-widget-header">
            {{widget.config.header}}
        </section>

        <section class="uni-widget-content shortcut-list">
            <ul>
                <li *ngFor="let item of items">
                    <a (click)="navigateOnClick(item.link)" title="{{LISTTITLE}}">{{ item.label }} </a>
                    <a class="uni-shortcutlist-newicon"
                        *ngIf="item.urlToNew" (click)="navigateOnClick(item.urlToNew)"
                        title="{{NEWTITLE}}"> </a>
                </li>
            </ul>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class UniShortcutListWidget {
    public LISTTITLE: string = 'Gå til liste';
    public NEWTITLE: string = 'Opprett ny';
    public widget: IUniWidget;
    public items: Array<any>;

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    public ngAfterViewInit() {
        if (this.widget) {

            // Authenticate all routes/modules
            this.authService.authentication$.subscribe(auth => {
                if (auth.user) {
                    this.checkRoutes(auth.user);
                    this.cdr.markForCheck();
                }
            });

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
