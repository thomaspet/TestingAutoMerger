import {Injectable, EventEmitter} from '@angular/core';
import {URLSearchParams} from '@angular/http'
import {RequestMethod} from "@angular/http";
import {UniHttp} from './http';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/concatMap";

@Injectable()
export class BizHttp<T> {

    protected BaseURL: string;
    protected LogAll: boolean;
    protected DefaultOrderBy: string;
    protected defaultExpand: string[];
    protected debounceTime:number = 500;
    // should be found based on type of T. Set in childclass constructor now
    protected relativeURL: string;

    public GetRelativeUrl(): string {
        return this.RelativeURL;
    }

    public setRelativeUrl(relativeurl: string) {
        this.RelativeURL = relativeurl;
    }

    constructor(protected http: UniHttp) {
        this.BaseURL = http.getBaseUrl();
        this.LogAll = true;
    }

    public Get<T>(ID: number|string, expand?: string[]): Observable<any> {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }
        if (!ID) {
            ID = 'new';
        }
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.RelativeURL + '/' + ID)
            .send({
                expand: expandStr
            });
    }

    public GetAllByUrlSearchParams<T>(params: URLSearchParams): Observable<any> {
        if (!params.get('orderby') && this.DefaultOrderBy !== null) {
            params.set('orderby', this.DefaultOrderBy);            
        }
        
        if (!params.get('expand') && this.defaultExpand) {
            params.set('expand', this.defaultExpand.join())
        }
                
        return this.http
            .usingBusinessDomain()
            .asGET()            
            .withEndPoint(this.RelativeURL)            
            .send({}, true, params);        
    }

    public GetAll<T>(query: string, expand?: string[]): Observable<any> {
        if (this.DefaultOrderBy !== null && (query === null || (query !== null && query.toLowerCase().indexOf('orderby') === 0))) {
            if (query !== null) {
                query += '&orderby=' + this.DefaultOrderBy;
            } else {
                query = 'orderby=' + this.DefaultOrderBy;
            }
        }

        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }

        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.RelativeURL + (query ? '?' + query : ''))
            .send({
                expand: expandStr
            });
    }

    public Post<T>(entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.RelativeURL)
            .send();
    }

    public Put<T>(ID: number, entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withBody(entity)
            .withEndPoint(this.RelativeURL + '/' + ID)
            .send();
    }

    public Remove<T>(ID: number, entity: T): void {
        // maybe not neccessary to include entity as parameter?
        // could be useful for validating if entity could be deleted?
        this.http
            .usingBusinessDomain()
            .asDELETE()
            .withEndPoint(this.RelativeURL + '/' + ID)
            .send();
    }

    public Transition<T>(ID: number, entity: T, transitionName: string): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.RelativeURL + '/' + ID + '?action=' + transitionName)
            .send();
    }
     
    public Action<T>(ID: number, actionName: string, parameters: string = null, method: number = RequestMethod.Put): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withEndPoint(this.RelativeURL + '/' + (ID === null ? '' : ID) + '?action=' + actionName + (parameters === null ? '' : '&' + parameters))
            .send();
    }
    
    public ActionWithBody<T>(ID: number, entity: T, actionName: string, method: number = RequestMethod.Put): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withBody(entity)
            .withEndPoint(this.RelativeURL + '/' + ID + '?action=' + actionName)
            .send();
    }

    public GetAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Get);    
    }

    public PostAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Post);    
    }

    public PutAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Put);    
    }

    public DeleteAction<T>(ID: number, actionName: string, parameters: string = null) {
        return this.Action(ID, actionName, parameters, RequestMethod.Delete);    
    }

    public GetNewEntity(expand?: string[], entityname: string = null) {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        }

        //TODO. Needs a more robust way to handle the Singular Url needed for this request.
        //let relativeUrlSingular = this.RelativeURL.slice(0, this.RelativeURL.length - 1); 
        let relativeUrlSingular = entityname != null ? entityname : this.RelativeURL.slice(0, this.RelativeURL.length - 1);
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(relativeUrlSingular + '/new')
            .send({
                expand: expandStr
            });
    }

    public GetLayout(ID: string) {
        var endPoint = ['layout', ID].join('/');
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(endPoint)
            .send();
    }

    public GetLayoutAndEntity(LayoutID: string, EntityID: number) {
        var layout, self = this;
        return this.GetLayout(LayoutID)
            .concatMap((data: any) => {
                layout = data;
                return self.Get(EntityID, data.Expands);
            })
            .map((entity: any) => {
                return [layout, entity];
            });
    }
}
