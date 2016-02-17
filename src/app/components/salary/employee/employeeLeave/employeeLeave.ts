import {Component, ViewChild, Injector} from 'angular2/core';
import {RouteParams} from "angular2/router";
import {EmployeeDS} from "../../../../../framework/data/employee";
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'employee-leave',
    templateUrl: 'app/components/salary/employee/employeeLeave/employeeLeave.html',
    directives: [UniTable]
})
export class EmployeeLeave {
    @ViewChild(UniTable) table: UniTable;
    
    localData: any;
    
    leaveType: Array<any> = [
        {ID: 0, Name: "ikke satt"},
        {ID: 1, Name: "Permisjon"},
        {ID: 2, Name: "Permittering"}
    ]
    
    dataConfig;
    constructor(private Injector: Injector, public employeeDS:EmployeeDS) {
        let params = Injector.parent.parent.get(RouteParams);
        Observable.forkJoin(
            employeeDS.get(params.get("id"))
        ).subscribe((response: any) => {
            let [employee] = response;
        })
        
    }
    
    buildTableConfigs(){
        var idCol = new UniTableColumn('ID', 'Id', 'number')
        .setEditable(false)
        .setNullable(true);
        
        var leavePercentCol = new UniTableColumn('LeavePercent', 'Andel permisjon', 'percent');
        var commentCol = new UniTableColumn('Description', 'Kommentar', 'string');
        
        this.localData = [
            {ID: 1, LeavePercent: 10, Description: "Kommentar 1"},
            {ID: 2, LeavePercent: 20, Description: "Kommentar 2"},
            {ID: 3, LeavePercent: 30, Description: "Kommentar 3"},
            {ID: 4, LeavePercent: 40, Description: "Kommentar 4"},
            {ID: 5, LeavePercent: 50, Description: "Kommentar 5"},
            {ID: 6, LeavePercent: 55, Description: "Kommentar 6"},
        ];
        
        var selectCallback = (selectedItem) => {
            console.log('Selected: ');
            console.log(selectedItem);
        }
        
        this.dataConfig = new UniTableBuilder('EmployeeLeave', false)
        .setPageSize(5)
        .addColumns(idCol, leavePercentCol, commentCol)
        .setSelectCallback(selectCallback);
    }
}