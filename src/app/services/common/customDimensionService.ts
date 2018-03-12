import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {DimensionSettings} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class CustomDimensionService {

    constructor(private http: UniHttp) { }

    public getCustomDimensionList(dimension: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension)
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
}
