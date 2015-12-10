import {Component, AfterViewInit} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {Routes, APP_ROUTES} from '../../../route.config';

@Component({
	selector: 'uni-tabstrip',
	templateUrl: 'app/components/navbar/tabstrip/tabstrip.html',
	directives: [ROUTER_DIRECTIVES]
})
export class Tabstrip implements AfterViewInit {
    public routes = Routes;
    openTabs: Array<any>;

    constructor(public router: Router) {
        this.openTabs = this.getOpenTabs();
    }

    getOpenTabs(): Array<any> {
        return [
            { name: 'Dashboard', unsavedWork: true, href: '/' },
            { name: 'UniFromDemo', unsavedWork: false, href: '/uniformdemo' },
        ];
    }

    addNewTab(newTab): void {
        //this.openTabs.push(newTab);
        this.openTabs.push({ name: 'Kitchensink', unsavedWork: false, href: '/kitchensink' });
    }

    tabClicked(tab): void {
        this.router.navigateByUrl(tab.href);
    }

    closeTab(tab, index): void {
        if (tab.unsavedWork) {
            //Needs custom alert box with options? 
            alert('The tab you are about to close has unsaved work. Would you like to dismiss this work?');
        } else {
            this.openTabs.splice(index, 1);
        }
    }

	ngAfterViewInit() {}
}