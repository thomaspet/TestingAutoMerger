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
            .map(res => res.body);
    }

    public getCustomDimension(dimension: number, id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id)
            .send()
            .map(res => res.body);
    }

    public saveCustomDimension(dimension: number, body: any) {
        if (body.ID) {
            return this.http
            .asPUT()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + body.ID)
            .withBody(body)
            .send()
            .map(res => res.body);
        } else {
            return this.http
            .asPOST()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension)
            .withBody(body)
            .send()
            .map(res => res.body);
        }
    }

    public getMetadata() {
        return this.http
        .asGET()
        .usingBusinessDomain()
        .withEndPoint('dimensionsettings')
        .send()
        .map(res => res.body);


    }

    public checkIfUsed(dimension: number, id: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id + '?action=is-used')
            .send()
            .map(res => res.body);
    }

    public Remove(dimension: number, id: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('dimension' + dimension + '/' + id)
            .send()
            .map(res => res.body);
    }

    public mapDimensionInfoToDimensionObject(dims) {
        const info = dims.Info[0];
        if (dims.ProjectID && !dims.Project) {
            dims.Project = {
                ProjectNumber: info.ProjectNumber,
                Name: info.ProjectName
            };
        }
        if (dims.DepartmentID && !dims.Department) {
            dims.Department = {
                DepartmentNumber: info.DepartmentNumber,
                Name: info.DepartmentName
            };
        }

        for (let i = 5; i <= 10; i++) {
            if (dims[`Dimension${i}ID`] && !dims[`Dimension${i}`]) {
                dims[`Dimension${i}`] = {
                    Number: info[`Dimension${i}Number`],
                    Name: info[`Dimension${i}Name`]
                };
            }
        }
        return dims;
    }
}
