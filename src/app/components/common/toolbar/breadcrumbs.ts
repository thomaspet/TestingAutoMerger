import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {NavbarLinkService} from '@app/components/layout/navbar/navbar-link-service';

@Component({
    selector: 'uni-breadcrumbs',
    template: `
        <ol class="breadcrumbs" role="navigation">
            <li *ngFor="let crumb of crumbs">
                <a [routerLink]="crumb.url">{{ crumb.name | translate }}</a>
            </li>
        </ol>
    `
})
export class UniBreadcrumbs {
    @Input() omitFinalCrumb: boolean;

    public crumbs: any[] = [];

    constructor(
        private navbarLinkService: NavbarLinkService,
        private router: Router
    ) {}

    ngOnChanges() {
        // Timeout to avoid changedAfterCheck errors
        setTimeout(() => this.generateBreadcrumbs(this.router.url || ''));
    }

    private generateBreadcrumbs(url) {
        let urlWithoutParams = url.split('?')[0];
        urlWithoutParams = url.split(';')[0];

        let urlParts = urlWithoutParams.split('/');

        // Filter out empty parts
        urlParts = urlParts.filter(part => !!part);

        // Remove last urlPart because we dont want a crumb for the current view
        // e.g '/sales/invoices' should only give sales breadcrumb
        urlParts.pop();

        if (urlParts.length) {
            let links = this.navbarLinkService.linkSections$;
            if (urlParts[0] === 'settings') {
                 links = this.navbarLinkService.settingsSection$;
            }

            links.subscribe(linkSections => {
                const routeSections = [];
                const parentSection = linkSections.find(section => section.url === '/' + urlParts[0]);

                if (parentSection) {
                    routeSections.push(parentSection);

                    if (urlParts.length > 1) {
                        const childRoutes = [];
                        parentSection.linkGroups.forEach(linkGroup => {
                            childRoutes.push(...linkGroup.links);
                        });

                        const childSection = childRoutes.find(route => {
                            return route.url === `/${urlParts[0]}/${urlParts[1]}`;
                        });

                        if (childSection) {
                            routeSections.push(childSection);
                        }
                    }

                    if (this.omitFinalCrumb && routeSections.length > 1) {
                        routeSections.pop();
                    }

                    this.crumbs = routeSections;
                }
            });
        }
    }
}
