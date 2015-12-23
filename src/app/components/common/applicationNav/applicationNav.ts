import {Component, Input, AfterViewInit} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

export interface ApplicationNavLink {
    childRouteName: string,
    linkTitle: string
}

@Component({
    selector: 'uni-application-nav',
    templateUrl: 'app/components/common/applicationNav/applicationNav.html',
    directives: [ROUTER_DIRECTIVES]
})
export class ApplicationNav {
    @Input() links: Array<ApplicationNavLink>;
}