import {Injectable, EventEmitter} from 'angular2/core';
import {UniHttp} from './http';
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/concatMap";

@Injectable()
export class BizHttp<T> {

    protected BaseURL: string;
    protected LogAll: boolean;
    protected DefaultOrderBy: string;
    protected defaultExpand: string[];
    
    // should be found based on type of T. Set in childclass constructor now
    protected relativeURL: string;

    public GetRelativeUrl(): string {
        return this.relativeURL;
    }

    public setRelativeUrl(relativeurl: string) {
        this.relativeURL = relativeurl;
    }

    constructor(protected http: UniHttp) {
        this.BaseURL = http.getBaseUrl();
        this.LogAll = true;
    }

    public Get<T>(ID: number, expand?: string[]): Observable<any> {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        } else if (this.defaultExpand) {
            expandStr = this.defaultExpand.join(',');
        }
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send({
                expand: expandStr
            });
    }

    public GetAll<T>(query: string): Observable<any> {
        if (this.DefaultOrderBy !== null && (query === null || (query !== null && query.toLowerCase().indexOf('orderby') === 0))) {
            if (query !== null) {
                query += '&orderby=' + this.DefaultOrderBy;
            } else {
                query = 'orderby=' + this.DefaultOrderBy;
            }
        }

        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint(this.relativeURL + (query ? '?' + query : ''))
            .send();
    }

    public Post<T>(entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL)
            .send();
    }

    public Put<T>(ID: number, entity: T): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPUT()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID)
            .send();
    }

    public Remove<T>(ID: number, entity: T): void {
        // maybe not neccessary to include entity as parameter?
        // could be useful for validating if entity could be deleted?
        this.http
            .usingBusinessDomain()
            .asDELETE()
            .withEndPoint(this.relativeURL + '/' + ID)
            .send();
    }

    public Transition<T>(ID: number, entity: T, transitionName: string): Observable<any> {
        return this.http
            .usingBusinessDomain()
            .asPOST()
            .withBody(entity)
            .withEndPoint(this.relativeURL + '/' + ID + '?action=' + transitionName)
            .send();
    }

    public Action<T>(ID: number, actionName: string, parameters: string = null): Observable<any> {        
        return this.http
            .asPUT()
            .withEndPoint(this.relativeURL + (ID === null ? '' : ID) + '?action=' + actionName + (parameters === null ? '' : '&' + parameters))
            .send();
    }

    GetNewEntity(expand?: string[]) {
        let expandStr;
        if (expand) {
            expandStr = expand.join(',');
        }
        return this.http
            .usingMetadataDomain()
            .asGET()
            .withEndPoint(this.relativeURL + '/new')
            .send({
                expand: expandStr
            });
    }

    GetLayout(ID: string) {
        var endPoint = ["layout", ID].join("/");
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
