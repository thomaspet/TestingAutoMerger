import {Injectable} from '@angular/core';

@Injectable()
export class ParamsService {
    private params: any = {};
    constructor() {}
    
    public get(id: any) {
        return this.params[id]; 
    }
    
    public set(key: any, value: any) {
        this.params[key] = value;
        return this;
    }
}