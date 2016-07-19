import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {UniTabs} from '../layout/uniTabs/uniTabs';

@Component({
    selector: 'uni-examples',
    template: `
        <h3>Demo of front-end components</h3>
        <uni-tabs [routes]='childRoutes' class='horizontal_nav'></uni-tabs>
        <router-outlet></router-outlet>
    `,
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Examples {
    private childRoutes: any[];

    constructor() {
        this.childRoutes = [
            {name: 'UniFormDemo', path: 'form'},
            {name: 'XFormDemo', path: 'xform'},
            {name: 'Table demo', path: 'tablenew'},
            {name: 'Image demo', path: 'image'},
            {name: 'Modal', path: 'modal'},
            {name: 'Avansert modal', path: 'modal-advanced'},
            {name: 'Dokument', path: 'documents'},
            {name: 'Save', path: 'save'},
            {name: 'Toast', path: 'toast'},
            {name: 'Select', path: 'select'},
        ];
    }
}
