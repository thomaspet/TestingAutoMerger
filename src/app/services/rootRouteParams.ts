import {Injectable} from '@angular/core';
import {RouteParams} from '@angular/router-deprecated';

@Injectable()
export class RootRouteParamsService {
    
    private _params: RouteParams;
    
    public set params(params: RouteParams) {
        this._params = params;
    }
    
    public get params() {
        return this._params;
    }    
}
