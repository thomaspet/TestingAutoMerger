import {Injectable} from '@angular/core';

@Injectable()
export class RootRouteParamsService {
    
    private _params: any;
    
    public set params(params: any) {
        this._params = params;
    }
    
    public get params() {
        return this._params;
    }    
}
