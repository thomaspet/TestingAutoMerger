import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';
import {NavbarLinkService} from '@app/components/layout/navbar/navbar-link-service';

@Component({
    selector: 'uni-breadcrumbs',
    template: `
        <ul class="breadcrumbs" role="navigation">
            <li *ngFor="let crumb of crumbs; let idx = index">
                <i class="material-icons" *ngIf="idx > 0">
                    chevron_right
                </i>

                <a [routerLink]="crumb.url">{{ crumb.name | translate }}</a>
            </li>
        </ul>
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



        if (urlParts.length) {
            let links = this.navbarLinkService.linkSections$;
            if (urlParts[0] === 'settings') {
                links = this.navbarLinkService.settingsSection$;
            }

            links.subscribe(linkSections => {
                const routeSections = [];
                const parentSection = this.getParentSection(linkSections, urlParts);

                if (parentSection) {
                    routeSections.push(parentSection);

                    // Remove last urlPart because we dont want a crumb for the current view
                    // e.g '/sales/invoices' should only give sales breadcrumb
                    urlParts.pop();

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

    private getParentSection(linkSections, urlParts) {
        if (!urlParts?.length) {
            return;
        }

        const possibleParentSections = linkSections.filter(section => {
            return section.url === '/' + urlParts[0];
        });

        if (possibleParentSections.length === 1) {
            return possibleParentSections[0];
        } else {
            // If we have more than one possible parent section
            // (e.g both "Expense" and "Accounting" have /accounting as base url)
            // we need to look at their links to find the correct section.
            const fullUrl = '/' + urlParts.join('/');
            return possibleParentSections.find(section => {
                return section.linkGroups.some(linkGroup => {
                    return linkGroup.links.some(link => {
                        console.log(link.url + ' - ' + fullUrl);
                        return link.url !== '/' && fullUrl.includes(link.url);
                    });
                });
            });
        }
    }
}
