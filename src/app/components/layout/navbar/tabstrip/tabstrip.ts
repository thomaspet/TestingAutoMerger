import {Component} from "@angular/core";
import {NgClass} from '@angular/common';
import {ROUTER_DIRECTIVES, Router} from "@angular/router-deprecated";
import {TabService} from "./tabService";

export interface IUniTab {
    url: string;
    name: string;
    active?: boolean;
    moduleID?: number;
}

@Component({
    selector: "uni-tabstrip",
    templateUrl: "app/components/layout/navbar/tabstrip/tabstrip.html",
    directives: [ROUTER_DIRECTIVES, NgClass]
})
export class UniTabStrip {

    constructor(private router: Router, public tabService: TabService) {
    }

    activateTab(tab: IUniTab, index: number): void {
        //Removes active class on previous active
        this.tabService.currentActiveTab.active = false;

        //Adds active class to new active tab.
        this.tabService.setTabActive(index);

        //Navigates to new active tab
        this.router.navigateByUrl(tab.url);
    }

    closeTab(tab: IUniTab, index: number): void {
        var newTab = this.tabService.removeTab(tab, index);
        if (newTab.name !== this.tabService.currentActiveTab.name) {
            this.tabService.addTab(newTab);
            this.router.navigateByUrl(newTab.url);
        }
    }

}