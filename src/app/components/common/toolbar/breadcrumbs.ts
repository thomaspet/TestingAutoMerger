import {Component, Input} from '@angular/core';
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
    @Input()
    public omitFinalCrumb: boolean;

    private moduleID: UniModules;
    private crumbs: any[] = [];

    constructor(private tabService: TabService) {}

    public ngOnChanges() {
        this.tabService.activeTab$.subscribe((activeTab) => {
            if (activeTab) {
                this.moduleID = activeTab.moduleID;
                this.buildBreadcrumbs();
            }
        });
    }

    private buildBreadcrumbs() {
        let crumbs = [];
        let parentApp = HamburgerMenu.getParentApp(this.moduleID);

        if (!parentApp) {
            return;
        }

        crumbs.push({
            title: parentApp.componentListName,
            url: '/#' + parentApp.componentListUrl
        });

        if (!this.omitFinalCrumb) {
            let finalComponent = parentApp.componentList.find((component) => {
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
    }
}
