import {Component} from 'angular2/core';
import {Router, RouteConfig} from 'angular2/router';

import {UniTable, UniTableConfig} from '../../../../framework/uniTable';

@Component({
    templateUrl: 'app/components/salary/employee/employeeList.html',    
    directives: [UniTable]
})

export class EmployeeList {
    employeeTableConfig;
    
    constructor(router: Router) {
        this.employeeTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/employees', true, false)
        .setOdata({
            expand: 'BusinessRelationInfo,BusinessRelationInfo.Phones',
            filter: 'Active eq true'
         })
         .setDsModel({
             id: 'ID',
             fields: {
                 ID: {type: 'number'},
                 BusinessRelationInfo: {
                     Name: {type: 'text'},
                 },
                 BirthDate: {type: 'date'},
             }
         })
         .setColumns([
             {field: 'ID', title: 'Ansattnummer'},
             {field: 'BusinessRelationInfo.Name', title: 'Navn'},
             {field: 'BirthDate', title: 'Fødselsdato', format: '{0: dd. MMM yyyy}'},
         ])
         .setOnSelect((selectedEmployee) => {
            router.navigateByUrl('/salary/employees/' + selectedEmployee.ID); 
         });
    }
}