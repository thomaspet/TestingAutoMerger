import {Injectable} from 'angular2/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {IEmployee} from '../../../../framework/interfaces/interfaces';
import {LayoutHttp} from '../../../../framework/core/http/LayoutHttp';

//observable operations
import 'rxjs/add/operator/concatMap';

@Injectable()
export class EmployeeService extends BizHttp<IEmployee> {

    http: UniHttp;
    layout: LayoutHttp;

    constructor(http: UniHttp, layout: LayoutHttp) {
        super(http);
        this.RelativeURL = 'Employees';
        this.layout = layout;
    }

    getLayout(id: string) {
        return this.layout.Get(id);
    }

    getEmployee(ID: number, expand: string[]) {
        var endPoint = [this.RelativeURL, ID].join('/');
        return this.http
            .asGET()
            .withEndPoint(endPoint)
            .send({
                expand: expand.join(',')
            });
    }

    getLayoutAndEmployee(LayoutID: string, EmployeeID: number) {
        var layout, self = this;
        return this.getLayout(LayoutID)
            .concatMap((data: any) => {
                layout = data;
                return self.getEmployee(EmployeeID, data.Expands);
            })
            .map((employee: IEmployee) => {
                return [layout, employee];
            });
    }
}
