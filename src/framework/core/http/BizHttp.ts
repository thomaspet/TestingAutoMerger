import {Injectable} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {RequestMethod} from '@angular/http';
import {UniHttp} from './http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';

@Injectable()
export class BizHttp<T> {

    protected BaseURL: string;
    protected LogAll: boolean;
    protected DefaultOrderBy: string;
    protected defaultExpand: string[];
    protected debounceTime: number = 500;
    // should be found based on type of T. Set in childclass constructor now
    protected relativeURL: string;
    protected entityType: string;

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
            .withEndPoint(this.relativeURL + '/' + ID)
            .send({
                expand: expandStr
            })
            .map(response => response.json());
    }

    public GetAllByUrlSearchParams<T>(params: URLSearchParams): Observable<any> {
        // use default orderby for service if no orderby is specified
        if (!params.get('orderby') && this.DefaultOrderBy !== null) {
            params.set('orderby', this.DefaultOrderBy);            
        }
        
        // use default expands for service if no expand is specified
        if (!params.get('expand') && this.defaultExpand) {
            params.set('expand', this.defaultExpand.join());
        }
        
        // remove empty filters, causes problem on backend
        if (params.get('filter') === '') {
            params.delete('filter');
        }
                
        return this.http
            .usingBusinessDomain()
            .asGET()            
            .withEndPoint(this.relativeURL)
            .send({}, params);
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
            .withEndPoint(this.relativeURL + (query ? '?' + query : ''))
            .send({
                expand: expandStr
            })
            .map(response => response.json());
    }

    public Post<T>(entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL)
            .send()
            .map(response => response.json());
    }

    public Put<T>(ID: number, entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID)
            .send()
            .map(response => response.json());
    }

    public Remove<T>(ID: number, entity: T): Observable<any> {
        // maybe not neccessary to include entity as parameter?
        // could be useful for validating if entity could be deleted?
        return this.http
            .usingBusinessDomain()
            .asDELETE()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send()
            .map(response => response.json());
    }

    public Transition<T>(ID: number, entity: T, transitionName: string): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID + '?action=' + transitionName)
            .send()
            .map(response => response.json());
    }
     
    public Action<T>(ID: number, actionName: string, parameters: string = null, method: number = RequestMethod.Put): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withEndPoint(this.relativeURL + '/' + (ID === null ? '' : ID) + '?action=' + actionName + (parameters === null ? '' : '&' + parameters))
            .send()
            .map(response => response.json());
    }
    
    public ActionWithBody<T>(ID: number, entity: T, actionName: string, method: number = RequestMethod.Put): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .as(method)
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID + '?action=' + actionName)
            .send()
            .map(response => response.json());
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

        // TODO. Needs a more robust way to handle the Singular Url needed for this request.
        // let relativeUrlSingular = this.relativeURL.slice(0, this.relativeURL.length - 1); 
        let relativeUrlSingular = entityname != null ? entityname : this.relativeURL.slice(0, this.relativeURL.length - 1);
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(relativeUrlSingular + '/new')
            .send({
                expand: expandStr
            })
            .map(response => response.json());
    }

    public GetLayout(ID: string) {
        var endPoint = ['layout', ID].join('/');
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(endPoint)
            .send()
            .map(response => response.json());
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
    
    public getNewGuid(): string {
        return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)});
    }

    public getNextID(currentID: number): Observable<number> {
        type statisticsResponse = {Data: {ID: number}[]};
        return this.http
            .usingBusinessDomain()
            .asGET()
            .usingStatisticsDomain()
            .withEndPoint(`?model=${this.entityType}&select=ID as ID&filter=ID gt ${currentID}&orderby=ID&top=1`)
            .send()
            .map(response => response.json())
            .map((response: statisticsResponse) => {
                return response.Data.length > 0 ? response.Data[0].ID : null;
            });
    }


    public getPreviousID(currentID: number): Observable<number> {
        type statisticsResponse = {Data: {ID: number}[]};
        return this.http
            .usingBusinessDomain()
            .usingStatisticsDomain()
            .asGET()
            .withEndPoint(`?model=${this.entityType}&select=ID as ID&filter=ID lt ${currentID}&orderby=ID DESC&top=1`)
            .send()
            .map(response => response.json())
            .map((response: statisticsResponse) => {
                return response.Data.length > 0 ? response.Data[0].ID : null;
            });
    }
}
