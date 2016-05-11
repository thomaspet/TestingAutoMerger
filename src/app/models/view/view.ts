import {ComponentProxy} from '../../../framework/core/componentProxy';
import {AsyncRoute} from '@angular/router-deprecated';

export class View {
    public subViews: Array<View> = [];
    private routeName = '';
    public path = '';
    public route = '';
    
    constructor(public name:string, public label:string, public className:string ) {
        this.routeName = this.name.substr(0,1).toUpperCase() + this.name.substr(1);
        this.path = '/' + name;
        this.route = this.path;
    }
   
    getSubView(name:string) {
        for (var i=0; i<this.subViews.length;i++) {
            if (this.subViews[i].name===name) {
                 return this.subViews[i]; 
            }
        }
    }
    
    addSubView(view:View) {
        view.path = this.path + '/' + view.name + '/' + view.name;
        view.route = this.route + '/' + view.name;
        this.subViews.push(view);
    }
    
    getAsyncRoute(asDefault:boolean): AsyncRoute {
        return new AsyncRoute({
                useAsDefault: asDefault,
                path: '/' + this.name,
                name: this.routeName,
                loader: () => ComponentProxy.LoadComponentAsync(this.className, './app/components' + this.path )
            });            
    }
    
    getSubRoutes(): Array<AsyncRoute> {
        var subroutes: Array<AsyncRoute> = [];
        for (var i=0; i<this.subViews.length; i++) {
            subroutes.push(this.subViews[i].getAsyncRoute(i===0));
        }
        return subroutes;
       
    }
}