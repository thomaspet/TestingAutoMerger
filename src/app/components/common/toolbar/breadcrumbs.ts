import {Component} from '@angular/core';
import {HamburgerMenu} from '../../layout/navbar/hamburgerMenu/hamburgerMenu';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'uni-breadcrumbs',
    template: `
        <ol class="breadcrumbs" role="navigation">
            <li><a class="home" href="/#/">Dashboard</a></li>
            <li *ngFor="let crumb of crumbs"><a [href]="crumb.url">{{crumb.title}}</a></li>
        </ol>
    `
})
export class UniBreadcrumbs {
    private moduleID: UniModules; // The moduleID, as per the TabService
    private crumbs: any[] = []; // Our breadcrumbs array

    constructor(private tabService: TabService) {
        // Getting the moduleID from the tabService.
        this.moduleID = this.tabService.currentActiveTab.moduleID;
    }

    public ngAfterViewInit() {
        // Cache the hamburger components
        let components = HamburgerMenu.getAvailableComponents();
        // The object for the parent app, from the hamburger.
        let parentApp = HamburgerMenu.getParentApp(this.moduleID);

        // Some apps don't have a specific parent, like the dashboard
        // and settings, so we won't add the top level crumb to those.
        if (parentApp !== components[0]) {
            this.crumbs.push({
                title: parentApp.componentListName,
                url: '/#' + parentApp.componentListUrl
            });
        }

        // Find the correct component, and add it to the crumbs.
        parentApp.componentList.find((component) => {
            if (component.moduleID !== this.moduleID) {
                return false;
            } else {
                this.crumbs.push({
                    title: component.componentName,
                    url: '/#' + component.componentUrl
                });
                return true;
            }
        });
    }
}
