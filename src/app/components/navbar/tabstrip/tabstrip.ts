import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../../route.config';
import {TabService} from './tabService';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromArray';

export interface NavbarTab {
    name: string;
    url: string;
}

@Component({
	selector: 'uni-tabstrip',
	templateUrl: 'app/components/navbar/tabstrip/tabstrip.html',
	directives: [ROUTER_DIRECTIVES],
})
export class Tabstrip {

    constructor(private router: Router, public tabService: TabService) {
        Observable.fromArray(tabService.tabs)
        .subscribe(
            function (x) {
                console.log('Next: ' + x);
            },
            function (err) {
                console.log('Error: ' + err);
            },
            function () {
                console.log('Completed');
            }
        );
    }

    addTab(): void {
        var tab = {name: 'Dashboard', url: '/'};
        this.tabService.addTab(tab);
        this.router.navigateByUrl(tab.url);
    }

    activateTab(tab): void {
        this.router.navigateByUrl(tab.url);
    }

    closeTab(tab): void {
        this.tabService.removeTab(tab.name);
    }

}