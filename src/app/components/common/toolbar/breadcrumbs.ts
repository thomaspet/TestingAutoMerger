import {Component, Input} from '@angular/core';
import {HamburgerMenu} from '../../layout/navbar/hamburgerMenu/hamburgerMenu';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {NavbarLinkService} from '@app/components/layout/navbar/navbar-link-service';

@Component({
    selector: 'uni-breadcrumbs',
    template: `
        <ol class="breadcrumbs" role="navigation">
            <li *ngFor="let crumb of crumbs"><a [href]="crumb.url">{{crumb.title}}</a></li>
        </ol>
    `
})
export class UniBreadcrumbs {
    @Input()
    public omitFinalCrumb: boolean;

    private moduleID: UniModules;
    private crumbs: any[] = [];

    constructor(
        private tabService: TabService,
        private navbarLinkService: NavbarLinkService
    ) {}

    public ngOnChanges() {
        this.tabService.activeTab$.subscribe((activeTab) => {
            if (activeTab) {
                this.moduleID = activeTab.moduleID;
                this.buildBreadcrumbs();
            }
        });
    }

    private buildBreadcrumbs() {
        this.navbarLinkService.linkSections$.subscribe(linkSections => {
            const moduleID = (this.moduleID || '').toString();
            const moduleIndex = +moduleID.substring(0, moduleID.length - 2) - 1;

            const parentApp = linkSections[moduleIndex];
            const crumbs: {title: string, url: string}[] = [];

            if (!parentApp) {
                return;
            }

            crumbs.push({
                title: parentApp.componentListName,
                url: '/#' + parentApp.componentListUrl
            });

            if (!this.omitFinalCrumb) {
                const finalComponent = parentApp.componentList.find((component) => {
                    return component.moduleID === this.moduleID;
                });

                if (finalComponent) {
                    crumbs.push({
                        title: finalComponent.componentName,
                        url: '/#' + finalComponent.componentUrl
                    });
                }
            }

            this.crumbs = crumbs;
        });
    }
}
