import {BaseApiService} from '../../../../framework/core/BaseApiService';
import {IAccount} from '../../../../framework/interfaces/interfaces';
import {UniHttp} from '../../../../framework/core/http';
import {IEmployee} from "../../../../framework/interfaces/interfaces";

export class EmployeeService extends BaseApiService<IEmployee> {

    constructor(http: UniHttp) {
        super(http);
        this.RelativeURL = 'Employees';
    }

    getLayout(id: string) {
        return this.http
            .asGET()
            .usingMetadataDomain()
            .withEndPoint('/layout/' + id)
            .send();
    }

    getEmployee(id: number, expand: string[]) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint('employees/' + id)
            .send({
                expand: expand.join(',')
            });
    }

    getAppData(EmployeeID: number, LayoutID: string) {
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
