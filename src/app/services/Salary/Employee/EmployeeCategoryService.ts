import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {EmployeeCategory, Employee, EmployeeCategoryLink} from '../../../unientities';

export class EmployeeCategoryService extends BizHttp<EmployeeCategory> {

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = EmployeeCategory.relativeUrl;
    }
    
    public saveCategoriesOnEmployee( employee: Employee) {
        // Save categories
        
        // Save categorylinks
        // var categorylinks: Array<EmployeeCategoryLink> = employee.EmployeeCategoryLinks;
        // categorylinks.forEach(link => {
        //     this.http.asPOST()
        //     .usingBusinessDomain()
        //     .withEndPoint('EmployeeCategoryLink')
        //     .withBody(link)
        //     .send();
        // });
        
    }
    
    public saveCategoriesForEmployee(employee: Employee, categories: Array<EmployeeCategory>) {
        
    }
    
    public saveCategory(category: EmployeeCategory) {
        super.Post(category);
    }

}