import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeCategory} from '../../../unientities';

export class EmployeeCategoryService extends BizHttp<EmployeeCategory> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeCategory.RelativeUrl;
        this.entityType = EmployeeCategory.EntityType;
    }
    
    public saveCategory(category: EmployeeCategory) {
        return super.Post(category);
    }
}
