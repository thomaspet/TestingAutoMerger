import {Component, ViewChild, ViewChildren, QueryList} from "@angular/core";
//import {Http, Headers} from 'angular2/http';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router, AsyncRoute} from "@angular/router-deprecated";

import {TabService} from "../../layout/navbar/tabstrip/tabService";
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {UniModal} from "../../../../framework/modals/modal";

import {ComponentProxy} from "../../../../framework/core/componentProxy";

import {PreviewModal} from "../modals/preview/previewModal";

const OVERVIEW_ROUTES = [];

@Component({
    selector: "uni-overview",
    templateUrl: "app/components/reports/overview/overview.html",
    directives: [ROUTER_DIRECTIVES, UniTabs, PreviewModal],
})
@RouteConfig(OVERVIEW_ROUTES)
export class Overview {
    childRoutes: RouteDefinition[];
    
    @ViewChild(PreviewModal)
    previewModal : PreviewModal
    
    constructor(public router: Router
                , private tabService: TabService
           ) {
        this.tabService.addTab({name: "Rapportoversikt", url: "/reports/overview"});
        this.childRoutes = OVERVIEW_ROUTES.slice(0, OVERVIEW_ROUTES.length - 1);
    }
    
    public showReport(reportName : string)
    {
        this.previewModal.open();
    }
    
}