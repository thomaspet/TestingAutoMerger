import {Component} from 'angular2/core';
import {TabService} from '../navbar/tabstrip/tabService';
import {UniHttpService, UniHttpRequest} from '../../../framework/data/uniHttpService';

@Component({
  selector: 'uni-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.html',
  directives: [],
  providers: [UniHttpService]
})
export class Dashboard {

    requests: UniHttpRequest;
    requests2: UniHttpRequest;

    constructor(private tabService: TabService, private hs: UniHttpService) {
        this.tabService.addTab({name: 'Dashboard', url: '/'});
        //this.hs.get
        //    ('/biz/employees/', 1, 'BusinessRelationInfo, Employments, BankAccounts, EmployeeCategoryLinks, VacationRateEmployee, Localization')
        //    .subscribe(data => console.log(data));

        //get(urlEndpoint, id: optional, expandValues: optional)

        this.requests = { resource: '/biz/companysettings/', id: 1, expand: 'Address,Emails,Phones' }

        this.requests2 = { resource: '/biz/employees/', id: 1, expand: 'BusinessRelationInfo,Employments,BankAccounts,EmployeeCategoryLinks,VacationRateEmployee,Localization' }

        //this.hs.get(this.requests)
        //    .subscribe(data => console.log(data),
        //    error => console.log(error)
        //)

        this.hs.getMultiple([this.requests, this.requests2])
            .subscribe(data => console.log(data),
            error => console.log(error)
            ) 

        
    }


  
}
