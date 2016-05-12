import {Component} from "@angular/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {UniTabs} from "../layout/uniTabs/uniTabs";
import {UniFormDemo} from "./form/formDemo";
import {UniTableDemo} from "./table/tableDemo";
import {UniTableDemoNew} from './table/tableDemoNew';
import {UniTreelistDemo} from "./treelist/treelistDemo";
import {UniModalDemo} from "./modal/modalDemo";
import {UniModalAdvancedDemo} from "./modal/advancedDemo";
import {UniDocumentDemo} from "./documents/document";

const CHILD_ROUTES = [
    {path: "/", redirectTo: ["./UniFormDemo"]},
    {path: "/form", component: UniFormDemo , as: "UniFormDemo"},
    {path: "/table", component: UniTableDemo , as: "UniTableDemo"},
    {path: "/tablenew", component: UniTableDemoNew, as: "UniTableDemoNew"},
    {path: "/treelist", component: UniTreelistDemo , as: "UniTreelistDemo"},
    {path: "/modal", component: UniModalDemo  , as: "UniModalDemo"},
    {path: "/modal-advanced", component: UniModalAdvancedDemo  , as: "UniModalAdvancedDemo"},
    {path: "/documents", component: UniDocumentDemo  , as: "UniDocumentDemo"},
];

@RouteConfig(CHILD_ROUTES)
@Component({
    selector: "uni-examples",
    templateUrl: "app/components/examples/examples.html",
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Examples {
    childRoutes: RouteDefinition[];

    constructor() {
        this.childRoutes = CHILD_ROUTES.slice(1); // we dont want the redirect route to be included in the navbar 
    }

}
