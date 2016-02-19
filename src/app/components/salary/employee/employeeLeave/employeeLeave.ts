import {Component, ViewChild, Injector} from 'angular2/core';
import {RouteParams} from "angular2/router";
import {EmployeeDS} from "../../../../../framework/data/employee";
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {IEmployment} from "../../../../../framework/interfaces/interfaces";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'employee-leave',
    templateUrl: 'app/components/salary/employee/employeeLeave/employeeLeave.html',
    directives: [UniTable]
})
export class EmployeeLeave {
    @ViewChild(UniTable) table: UniTable;
    
    currentEmployee;
    
    leaveType: Array<any> = [
        {ID: 0, Name: "ikke satt"},
        {ID: 1, Name: "Permisjon"},
        {ID: 2, Name: "Permittering"}
    ]
    
    dataConfig;
    constructor(private Injector: Injector, public employeeDS:EmployeeDS) {
        let params = Injector.parent.parent.get(RouteParams);
        employeeDS
            .get(params.get("id"))
            .subscribe((response) =>{
                this.currentEmployee = response;
                this.buildTableConfigs();
            });
    }
    
    buildTableConfigs(){
        
        var idCol = new UniTableColumn('ID', 'Id', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var fromDateCol = new UniTableColumn('FromDate', 'Startdato', 'string');
        var toDateCol = new UniTableColumn('ToDate', 'Sluttdato', 'string');
        var leavePercentCol = new UniTableColumn('LeavePercent', 'Andel permisjon', 'number');
        var commentCol = new UniTableColumn('Description', 'Kommentar', 'string');
        var leaveTypeCol = new UniTableColumn('LeaveType', 'Type', 'string');
        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold', 'string');
        
        var selectCallback = (selectedItem) => {
            console.log('Selected: ');
            console.log(selectedItem);
        }
        
        this.dataConfig = new UniTableBuilder('EmployeeLeave', true)
        .setFilter(this.buildFilter())
        .addColumns(idCol, fromDateCol, toDateCol, leavePercentCol, leaveTypeCol, employmentIDCol, commentCol)
        .setSelectCallback(selectCallback)
        .setToolbarOptions([]); //removes add,update and cancel buttons
    }
    
    buildFilter(){
        var filter = "";
        this.currentEmployee.Employments.forEach((employment:IEmployment) => {
            filter += " EmploymentID eq " + employment.ID + " or";
        });
        filter = filter.slice(0, filter.length - 2);
        console.log("EmployeeLeave filter: " + filter);
        return filter;
    }
}