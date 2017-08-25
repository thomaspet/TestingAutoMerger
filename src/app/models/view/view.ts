import {Route} from '@angular/router';

export class View {
    public subViews: Array<View> = [];
    private routeName: string = '';
    public filepath: string = '';
    public path: string = '';
    public url: string = '';
    public component: any;

    // tslint:disable-next-line:max-line-length
    constructor(public name: string, public label: string, public className: string, public isDetail = false, public folder = '', component?: any ) {
        this.routeName = this.name.substr(0, 1).toUpperCase() + this.name.substr(1);
        this.path = this.name + (this.isDetail ? '/:id' : '');
        this.url = '/' + this.name;
        this.filepath = '/' + (folder || name);
        this.component = component;
    }
    
    public addSubView(view: View) {
        view.filepath = this.filepath + '/' + (view.folder || view.name) + '/' + view.name;
        view.url = this.url + '/' + view.name;
        this.subViews.push(view);
    }
    
    public getRoute(asDefault: boolean): Route {
        return {
                path: this.path,
                component: this.component,
            };
    }
    
    public getSubRoutes(): Route[] {
        if (!this.subViews.length) {
            return [];
        }
        let subroutes: Route[] = [
            {
                path: '',
                pathMatch: 'full', // default
                redirectTo: this.subViews[0].path
            }
        ];
        for (let i = 0; i < this.subViews.length; i++) {
            subroutes.push(this.subViews[i].getRoute(i === 0));
        }
        return subroutes;
       
    }
    
}
