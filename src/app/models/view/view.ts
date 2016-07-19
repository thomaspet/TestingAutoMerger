import {Route, RouterConfig} from '@angular/router';
import {AuthGuard} from '../../AuthGuard';

export class View {
    public subViews: Array<View> = [];
    private routeName = '';
    public filepath = '';
    public path = '';
    public url = '';
    public component;

    constructor(public name:string, public label:string, public className:string, public isDetail = false, public folder = '', component: any ) {
        this.routeName = this.name.substr(0,1).toUpperCase() + this.name.substr(1);
        this.path = this.name + (this.isDetail ? '/:id' : '');
        this.url = '/' + this.name;
        this.filepath = '/' + (folder || name);
        this.component = component;
    }
    
    addSubView(view:View) {
        view.filepath = this.filepath + '/' + (view.folder || view.name) + '/' + view.name;
        view.url = this.url + '/' + view.name;
        this.subViews.push(view);
    }
    
    getRoute(asDefault:boolean): Route {
        return {
                // useAsDefault: asDefault,
                path: this.path,
                // name: this.routeName,
                component: this.component,
                // canActivate: [AuthGuard]
                // loader: () => ComponentProxy.LoadComponentAsync(this.className, './app/components' + this.filepath )
            };
    }
    
    getSubRoutes(): RouterConfig {
        if (!this.subViews.length) {
            return [];
        }
        let subroutes: RouterConfig = [
            {
                path: '',
                pathMatch: 'full', //default
                redirectTo: this.subViews[0].path
            }
        ];
        for (let i=0; i<this.subViews.length; i++) {
            subroutes.push(this.subViews[i].getRoute(i===0));
        }
        return subroutes;
       
    }
    
}