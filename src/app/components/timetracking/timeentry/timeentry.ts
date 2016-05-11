import {Component} from "@angular/core";
import {TabService} from '../../layout/navbar/tabstrip/tabService';
import {UniTabs} from '../../layout/uniTabs/uniTabs';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, Router} from '@angular/router-deprecated';
import {AsyncRoute} from '@angular/router-deprecated';
import {views} from '../timetracking';

@Component({
    selector: views.timeEntry.file,
    template: "<h3>{{view.label}}</h3>",
    directives: [ROUTER_DIRECTIVES]    
})
export class TimeEntry {    
    public view = views.timeEntry;
    constructor(private router: Router, private tabService: TabService) {
        this.tabService.addTab({ name: views.timeEntry.label, url: views.timeEntry.path });
        console.log( views.timeEntry.className + " (sub)view constructor");
    }
}