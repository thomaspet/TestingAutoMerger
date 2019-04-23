import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomDimensionService {

    constructor(private http: UniHttp) { }

    public getCustomDimensionList(dimension: number, odata?: string) {
        let endpoint = 'dimension' + dimension;
        if (odata) {
            endpoint += odata;
        }

        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(endpoint)
            .send()
            .map(res => res.json());
    }

    public getCustomDimension(dimension: number, id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id)
            .send()
            .map(res => res.json());
    }

    public saveCustomDimension(dimension: number, body: any) {
        if (body.ID) {
            return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + body.ID)
            .withBody(body)
            .send()
            .map(res => res.json());
        } else {
            return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension)
            .withBody(body)
            .send()
            .map(res => res.json());
        }
    }

    public getMetadata() {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint('dimensionsettings')
        .send()
        .map(res => res.json());


    }

    public checkIfUsed(dimension: number, id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id + '?action=is-used')
            .send()
            .map(res => res.json());
    }    

    public Remove(dimension: number, id: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id)
            .send()
            .map(res => res.json());
    }

}
