import {Component} from "@angular/core";
import {CORE_DIRECTIVES} from "@angular/common";
import {TabService} from "../layout/navbar/tabstrip/tabService";
import {Multival} from "../usertest/multivalue";
import {UniTabs} from "../layout/uniTabs/uniTabs";
import {PersonalDetails} from "../salary/employee/personalDetails/personalDetails";
import {EmployeeEmployment} from "../salary/employee/employments/employments";
import {ROUTER_DIRECTIVES, RouterConfig} from "@angular/router";
import {UniAutocomplete} from "../../../framework/controls/autocomplete/autocomplete";

const CHILD_ROUTES = [
    {path: "", component: PersonalDetails},
    {path: "employment", component: EmployeeEmployment},
];

@Component({
    selector: "uni-usertest",
    templateUrl: "app/components/usertest/usertest.html",
    directives: [CORE_DIRECTIVES, Multival, ROUTER_DIRECTIVES, UniTabs, UniAutocomplete]
})
export class Usertest {

    private phone = [
        {
            id: 0,
            value: "+47 55543265",
            main: true
        }, {
            id: 1,
            value: "+47 95529331",
            main: false
        }];

    private email = [
        {
            id: 0,
            value: "audhild@unimicro.no",
            main: false,

        },
        {
            id: 1,
            value: "audhild.grieg@gmail.com",
            main: true
        },
        {
            id: 2,
            value: "nsync4eva@hotmail.com",
            main: false
        }
    ];

    private accounts = [{
        id: 0,
        value: "9484.06.14799",
        main: true
    }];


    childRoutes: RouterConfig;

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: "Usertest", url: "/usertest"});
        this.childRoutes = CHILD_ROUTES;
    }

}
