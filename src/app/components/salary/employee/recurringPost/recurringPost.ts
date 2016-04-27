import {Component, OnInit, Injector} from 'angular2/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Router, RouteParams} from 'angular2/router'; 

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable]
})

export class RecurringPost implements OnInit {
    private recurringpostListConfig: any;
    private employeeID: number;
    
    constructor(public injector: Injector, public routr: Router) {
        var routeParams = this.injector.parent.parent.get(RouteParams);
        this.employeeID = +routeParams.get('id');
    }
    
    public ngOnInit() {
        
        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold', 'number');
        var wagetypeIDCol = new UniTableColumn('WageTypeID', 'Lønnsart', 'number');
        var descriptionCol = new UniTableColumn('Text', 'Beskrivelse', 'string');
        var fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', 'date');
        var todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', 'date');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var sumCol = new UniTableColumn('Sum', 'Sum', 'number');
        
        this.recurringpostListConfig = new UniTableBuilder('salarytrans', true)
        .setFilter(this.buildFilter())
        .setColumnMenuVisible(false)
        .setToolbarOptions(['create', 'cancel'])
        .addColumns(employmentIDCol, wagetypeIDCol, descriptionCol, fromdateCol, todateCol, amountCol, rateCol, sumCol);
    }
    
    private buildFilter() {
        var filter = 'EmployeeNumber eq ' + this.employeeID;
        filter += ' and IsRecurringPost eq true';
        return filter;
    }
}
