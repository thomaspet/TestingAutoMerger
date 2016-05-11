import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router} from '@angular/router-deprecated';
import {AsyncRoute} from '@angular/router-deprecated';
import {rootView} from '../timetracking';

var view = rootView.getSubView('timeentry');

@Component({
    selector: view.name,
    template: "<h3>{{view.label}}</h3>",
    directives: [ROUTER_DIRECTIVES]    
})
export class TimeEntry {    
    public view = view;

    constructor(private router: Router, private tabService: TabService) {
        console.log("TimeEntry path: " + view.path);
        this.tabService.addTab({ name: view.label, url: view.path });
    }
}