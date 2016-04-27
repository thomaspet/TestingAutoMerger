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
        console.log('ansattnr', this.employeeID);
    }
    
    public ngOnInit() {
        
        // Arbeidsforhold, Lønnsartid, beskrivelse, RecuringPostValidTo/From, Antall, Sats, Sum
        var wagetypeIDCol = new UniTableColumn('WageTypeID', 'Lønnsart', 'number');
        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold', 'number');
        var descriptionCol = new UniTableColumn('Text', 'Beskrivelse', 'string');
        
        this.recurringpostListConfig = new UniTableBuilder('salarytrans', true)
        .setFilter(this.buildFilter())
        .addColumns(wagetypeIDCol, employmentIDCol, descriptionCol);
    }
    
    private buildFilter() {
        var filter = 'EmployeeNumber eq ' + this.employeeID;
        filter += ' and IsRecurringPost eq true';
        return filter;
    }
}
