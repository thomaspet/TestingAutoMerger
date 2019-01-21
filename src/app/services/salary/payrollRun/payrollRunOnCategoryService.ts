import { Injectable } from '@angular/core';
import {EmployeeCategory, PayrollRun} from '@uni-entities';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import {UniHttp} from '@uni-framework/core/http/http';

@Injectable()
export class PayrollRunOnCategoryService extends BizHttp<EmployeeCategory> {

    constructor(
        protected http: UniHttp
    ) {
        super(http);
        this.entityType = EmployeeCategory.EntityType;
    }

    private getEndPoint(runID: number) {
        return `${PayrollRun.RelativeUrl}/${runID}/category`;
    }

    public getAll(runID: number, query?: string, expands?: string[]) {
        this.relativeURL = this.getEndPoint(runID);
        return super.GetAll(query, expands);
    }

    public get(runID: number, id: number | string, expand?: string[], hateoas?: boolean) {
        this.relativeURL = this.getEndPoint(runID);
        return this.Get(id, expand, hateoas);
    }
}
