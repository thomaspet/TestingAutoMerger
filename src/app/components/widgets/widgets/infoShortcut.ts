import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {IUniWidget} from '../uniWidget';
import {AuthService} from '../../../authService';

@Component({
    selector: 'uni-info-shortcut',
    template: `
        <section class="uni-widget-header">
            {{widget.description}}
        </section>

        <a *ngIf="widget?.config?.externalLink" target="_blank" href="{{widget?.config?.externalLink}}"
            style="text-decoration: none;">
            <section class="uni-widget-content info_shortcut_section">

                <img src="{{widget.config.imageLink}}">

                <div>
                    <p>
                        {{ widget?.config?.text.substr(0, 80) }}
                    </p>
                </div>
            </section>
        </a>

        <section *ngIf="!widget?.config?.externalLink"
            class="uni-widget-content info_shortcut_section"
            (click)="onShortcutClick()" >

            <img src="{{widget.config.imageLink}}" style="width: 100%; height: 50%; opacity: 0.5;">

            <div>
                <p>
                    {{ widget?.config?.text.substr(0, 80) }}
                </p>
            </div>
        </section>
    `
})

export class UniInfoShortcutWidget {

    private widget: IUniWidget;
    private hasModule: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {}

    public ngAfterViewInit() {

        if (this.widget) {

            // Authenticate all routes/modules
            this.authService.authentication$.subscribe(auth => {
                if (auth.user) {
                    if (this.widget.config.link &&
                        this.authService.canActivateRoute(auth.user, this.widget.config.link)) {
                            this.hasModule = true;
                    }
                }
            });
        }

    }

    public onShortcutClick() {
        if (!this.widget || !this.hasModule) {
            return;
        }
        this.router.navigateByUrl(this.widget.config.link);
    }

}
