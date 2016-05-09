import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES, Router} from "@angular/router-deprecated";
import {TabService} from "./tabService";

export interface IUniTab {
    url: string;
    name: string;
}

@Component({
    selector: "uni-tabstrip",
    templateUrl: "app/components/layout/navbar/tabstrip/tabstrip.html",
    directives: [ROUTER_DIRECTIVES],
})
export class UniTabStrip {

    constructor(private router: Router, public tabService: TabService) {
    }

    activateTab(tab: IUniTab): void {
        this.router.navigateByUrl(tab.url);
    }

    closeTab(tab: IUniTab): void {
        this.tabService.removeTab(tab.name);
    }

}