import {Component, Input} from 'angular2/core';
import {RouteDefinition, ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'uni-tabs',
    templateUrl: 'app/components/layout/uniTabs/uniTabs.html',
    directives: [ROUTER_DIRECTIVES]
})
export class UniTabs {
    @Input() routes: RouteDefinition[];
}