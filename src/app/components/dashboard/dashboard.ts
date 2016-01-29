import {Component} from 'angular2/core';
import {TabService} from '../navbar/tabstrip/tabService';
import {HttpService} from '../../../framework/data/httpService';

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
  directives: [],
  providers: [HttpService]
})
export class Dashboard {

    constructor(private tabService: TabService, private hs: HttpService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});
        //this.hs.get
        //    ('/biz/employees/', 1, 'BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization')
        //    .subscribe(data => console.log(data));

        //get(urlEndpoint, id: optional, expandValues: optional)


        console.log('i run');
        this.hs.getMultiple(
            ['/biz/employees/', '/biz/employees/', '/biz/employees/', '/biz/employees/'],
            [1, 1, 1, 1],
            ['BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization', 'BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization', 'BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization', 'BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization'])

    }


  
}
