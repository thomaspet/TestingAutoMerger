import {Component, Input} from 'angular2/core';
import {RouteDefinition, ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'uni-application-nav',
    templateUrl: 'app/components/common/applicationNav/applicationNav.html',
    directives: [ROUTER_DIRECTIVES]
})
export class ApplicationNav {
    @Input() routes: RouteDefinition[];
}