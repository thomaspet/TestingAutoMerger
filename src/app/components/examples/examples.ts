import {Component} from 'angular2/core';
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES} from 'angular2/router';

import {UniTabs} from '../layout/uniTabs/uniTabs';
import {UniFormDemo} from './form/formDemo';
import {UniTableDemo} from './table/tableDemo';
import {UniTreelistDemo} from './treelist/treelistDemo';
import {SpinnerExample} from "./spinner/spinner";

const CHILD_ROUTES = [
    {path: '/', redirectTo: ['./UniFormDemo']},
    {path: '/form', component: UniFormDemo , as: 'UniFormDemo'},
    {path: '/table', component: UniTableDemo , as: 'UniTableDemo'},
    {path: '/treelist', component: UniTreelistDemo , as: 'UniTreelistDemo'},
    {path: '/spinner', component: SpinnerExample , as: 'SpinnerExample'},
];

@RouteConfig(CHILD_ROUTES)
@Component({
    selector: 'uni-examples',
    templateUrl: 'app/components/examples/examples.html',
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Examples {
    childRoutes: RouteDefinition[];
    
    constructor() {
        this.childRoutes = CHILD_ROUTES.slice(1); // we dont want the redirect route to be included in the navbar 
    }
    
}