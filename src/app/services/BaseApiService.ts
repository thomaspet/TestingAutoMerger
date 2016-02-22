import {Injectable, EventEmitter} from 'angular2/core';
import {UniHttp} from '../../framework/core/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class BaseApiService<T> {    
    
    protected BaseURL : string;
    protected LogAll: boolean;
    protected DefaultOrderBy: string;
    
    //should be found based on type? set in childclass constructor now
    protected RelativeURL : string;
    
    public GetRelativeUrl() : string {
        return this.RelativeURL;
    }
    
    public GetApiUrl() {
        return this.BaseURL + "/" + this.RelativeURL;
    }
    
    constructor(protected http : UniHttp) {        
        this.BaseURL = http.getBaseUrl();
        this.LogAll = true;                
    }    
    
    public Get<T>(ID: number) : Observable<any> {
                
        return this.http
            .asGET()
            .withEndPoint(this.RelativeURL + '/' + ID)
            .send()
            .catch((err) => {                
                this.handleError(err);
                return Observable.throw(err);
            });                    
    }
        
    public GetAll<T>(query: string) : Observable<any> {
     
        if (this.DefaultOrderBy !== null && (query === null || (query !== null && query.toLowerCase().indexOf("orderby") === 0))) {
            if (query !== null) {
                query += '&orderby=' + this.DefaultOrderBy;
            } else {
                query = 'orderby=' + this.DefaultOrderBy;
            }            
        }
     
        return this.http
            .asGET()
            .withEndPoint(this.RelativeURL + (query ? '?' + query : ''))
            .send()                
            .catch((err) => {
                this.handleError(err);
                return Observable.throw(err);
            }); 
    }
    
    public Post<T>(entity: T) : Observable<any> {
        
        return this.http
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.RelativeURL)
            .send()                
            .catch((err) => {
                this.handleError(err);
                return Observable.throw(err);
            });
    }
    
    public Put<T>(ID: number, entity: T) : Observable<any> {        
                
        return this.http
            .asPUT()
            .withBody(entity)
            .withEndPoint(this.RelativeURL + "/" + ID)
            .send()         
            .catch((err) => {
                this.handleError(err);
                return Observable.throw(err);
            });
    }
    
    public Remove<T>(ID: number, entity: T) : void {        
        //maybe not neccessary to include entity as parameter? 
        //could be useful for validating if entity could be deleted?
                
        this.http
            .asDELETE()
            .withEndPoint(this.RelativeURL + "/" + ID)
            .send()
            .catch((err) => {
                this.handleError(err);
                return Observable.throw(err);
            });     
    }    
        
    public handleError(error) {
        
        //should use a logger class? also check for typical statuscodes, 
        //e.g. 401 and redirect to loginpage if the user is not logged in
        
        /*if (error.status === 401) {
            redirect to login view
        } else if (error.status === ...) {
            
        }*/
        
        console.log('Error occured in dataservice: ', error)        
    }
}
