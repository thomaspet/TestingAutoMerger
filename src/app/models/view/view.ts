import {ComponentProxy} from '../../../framework/core/componentProxy';
import {AsyncRoute} from '@angular/router-deprecated';

export class View {
    public subViews: Array<View> = [];
    private routeName = '';
    public filepath = '';
    public path = '';
    public url = '';
    
    constructor(public name:string, public label:string, public className:string, public isDetail = false, public folder = '' ) {
        this.routeName = this.name.substr(0,1).toUpperCase() + this.name.substr(1);
        this.path = '/' + this.name + (this.isDetail ? '/:id' : '');
        this.url = '/' + this.name;
        this.filepath = '/' + (folder || name);
    }
    
    addSubView(view:View) {
        view.filepath = this.filepath + '/' + (view.folder || view.name) + '/' + view.name;
        view.url = this.url + '/' + view.name;
        this.subViews.push(view);
    }
    
    getAsyncRoute(asDefault:boolean): AsyncRoute {
        return new AsyncRoute({
                useAsDefault: asDefault,
                path: this.path,
                name: this.routeName,
                loader: () => ComponentProxy.LoadComponentAsync(this.className, './app/components' + this.filepath )
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