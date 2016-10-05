import {Component} from '@angular/core';

@Component({
    selector: 'uni-examples',
    template: `
        <h3>Demo of front-end components</h3>
        <uni-tabs [routes]='childRoutes' class='horizontal_nav'></uni-tabs>
        <router-outlet></router-outlet>
    `
})
export class Examples {
    private childRoutes: any[];

    constructor() {
        this.childRoutes = [
            {name: 'XFormDemo', path: 'xform'},
            {name: 'Table demo', path: 'tablenew'},
            {name: 'Image demo', path: 'image'},
            {name: 'Modal', path: 'modal'},
            {name: 'Avansert modal', path: 'modal-advanced'},
            {name: 'Dokument', path: 'documents'},
            {name: 'Save', path: 'save'},
            {name: 'Toast', path: 'toast'},
            {name: 'Select', path: 'select'},
            {name: 'Dynamic', path: 'dynamic'},
        ];
    }
}
