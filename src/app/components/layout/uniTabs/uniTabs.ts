import {Component, Input} from '@angular/core';
import {RouteDefinition, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

@Component({
    selector: 'uni-tabs',
    templateUrl: 'app/components/layout/uniTabs/uniTabs.html',
    directives: [ROUTER_DIRECTIVES]
})
export class UniTabs {
    @Input() routes: RouteDefinition[];
}