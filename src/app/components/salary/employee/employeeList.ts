import {Component, ViewChild, ViewChildren, AfterViewInit} from 'angular2/core';
import {Router, RouteConfig} from 'angular2/router';

import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';

@Component({
    templateUrl: 'app/components/salary/employee/employeeList.html',    
    directives: [UniTable]
})

export class EmployeeList {
    @ViewChildren(UniTable) tables: any;
    
    employeeTableConfig;
    
    constructor(router: Router) {
        
        var idCol = new UniTableColumn("ID", "ID", "number")
        .setEditable(false);
        var empNmbCol = new UniTableColumn("EmployeeNumber", "Ansattnummer", "number")
        .setEditable(false);
        var nameCol = new UniTableColumn("BusinessRelationInfo.Name", "Navn", "string");
        var birthCol = new UniTableColumn("BirthDate", "Fødselsdato","datetime")
        .setNullable(true);
        
        var selectCallback = (selectedItem) => {
            router.navigateByUrl("/salary/employees/" + selectedItem.ID);
        };
        
        this.employeeTableConfig = new UniTableBuilder("employees",true)
        .setExpand("BusinessRelationInfo")
        .addColumns(idCol,empNmbCol,nameCol)
        .setSelectCallback(selectCallback);
        
        // this.employeeTableConfig = new UniTableConfig('http://devapi.unieconomy.no/api/biz/employees', true, false)
        // .setOdata({
        //     expand: 'BusinessRelationInfo,BusinessRelationInfo.Phones',
        //     filter: 'Active eq true'
        //  })
        //  .setDsModel({
        //      id: 'ID',
        //      fields: {
        //          ID: {type: 'number'},
        //          BusinessRelationInfo: {
        //              Name: {type: 'text'},
        //          },
        //          BirthDate: {type: 'date'},
        //      }
        //  })
        //  .setColumns([
        //      {field: 'ID', title: 'Ansattnummer'},
        //      {field: 'BusinessRelationInfo.Name', title: 'Navn'},
        //      {field: 'BirthDate', title: 'Fødselsdato', format: '{0: dd. MMM yyyy}'},
        //  ])
        //  .setOnSelect((selectedEmployee) => {
        //     router.navigateByUrl('/salary/employees/' + selectedEmployee.ID); 
        //  });
    }
}