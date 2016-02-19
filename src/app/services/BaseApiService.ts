import {Injectable} from 'angular2/core';
import {UniHttpService} from '../../framework/data/uniHttpService';

import {Observable} from 'rxjs/Observable';

@Injectable()
export class BaseApiService<T> {    
    
    protected BaseURL : string;
    
    //should be found based on type? set in childclass constructor now
    protected RelativeURL : string;
    
    public GetApiUrl() {
        return this.BaseURL + "/" + this.RelativeURL;
    }
    
    constructor(protected http : UniHttpService) {
        //TODO: Read from config-file (json config-file?)
        this.BaseURL = 'http://devapi.unieconomy.no/api/biz';
    }    
    
    public Get<T>(ID: number) : T {
        
        var result : T;
        
        this.http.get({
                resource: this.GetApiUrl() + '/' + ID
            })            
            .subscribe(
                (data) => {                    
                    result = data;                    
                },
                (error) => { 
                    console.log(error);
                }
            );
                
        return null;
    }
    
    public GetAll<T>(query: string) : T[] {
        //TODO call httpservice
     
        return null;
    }
    
    public Post<T>(entity: T) : number {
        //TODO call httpservice
        /*
        this.http.post({
                resource: "accounts/" + self.model.ID,
                body: T.model
            })            
            .subscribe(
                (data) => {
                    this.accountgroups = dataset[0];
                    this.loopAccountGroups(null, null);
                },
                (error) => console.log(error)
            );
               
        */
        return 0;
    }
    
    public Put<T>(ID: number, entity: T) : number {        
        //TODO call httpservice
        return 0;
    }
    
    public Delete<T>(ID: number, entity: T) : void {        
        //maybe not neccessary to include entity as parameter? could be useful for validating if entity could be deleted?
        
        //TODO call httpservice        
    }    
}