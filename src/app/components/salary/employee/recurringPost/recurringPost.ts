import {Component, OnInit, Injector} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/uniTable';
import {Router, RouteParams} from '@angular/router-deprecated';
import {WageTypeService, EmploymentService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';

declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable],
    providers: [WageTypeService, EmploymentService]
})

export class RecurringPost implements OnInit {
    private recurringpostListConfig: any;
    private employeeID: number;
    private wagetypes: any[];
    private employments: any[];
    private lastSavedInfo: string;
    
    constructor(public rootRouteParams: RootRouteParamsService, public routr: Router, private wagetypeService: WageTypeService, private employmentService: EmploymentService) {
        this.employeeID = +this.rootRouteParams.params.get('id');
    }
    
    public ngOnInit() {
        Observable.forkJoin(
            this.wagetypeService.GetAll(''),
            this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID)
        )
        .subscribe((response: any) => {
            let [wagetypes, employments] = response;
            this.wagetypes = wagetypes;
            this.employments = employments;
            this.buildTableConfig();
        });
        
    }
    
    public saveRecurringpostManual() {
        this.saveRecurringpost();
    }
    
    public saveRecurringpost() {
        console.log('save');
        this.lastSavedInfo = 'Faste poster er lagret';
    }
    
    private buildTableConfig() {
        var wagetypeIDCol = new UniTableColumn('WageTypeId', 'Lønnsart', 'number')
            .setValues(this.wagetypes)
            .setDefaultValue(null)
            .setCustomEditor('dropdown', {
                dataSource: this.wagetypes,
                dataValueField: 'WageTypeId',
                dataTextField: 'WageTypeName'
            }, (item, rowModel) => {
                let wagetype = _.find(this.wagetypes, wt => wt.WageTypeId === item.WageTypeId);
                rowModel.set('WageTypeId', wagetype.WageTypeId);
                rowModel.set('Text', wagetype.WageTypeName);
                rowModel.set('Amount', 1);
                rowModel.set('Rate', wagetype.Rate);
                rowModel.set('Sum', rowModel.Amount * rowModel.Rate);
                rowModel.set('Wagetype', wagetype);
                rowModel.set('IsRecurringPost', true);
            });
        var descriptionCol = new UniTableColumn('Text', 'Beskrivelse', 'string');
        var employmentIDCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold', 'number')
            .setValues(this.employments)
            .setDefaultValue(null)
            .setCustomEditor('dropdown', {
                dataSource: this.employments,
                dataValueField: 'ID',
                dataTextField: 'JobName'
            }, (item, rowModel) => {
                rowModel.set('EmploymentID', item.ID);
            });
        var fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', 'date');
        var todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', 'date');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var sumCol = new UniTableColumn('Sum', 'Sum', 'number');
        
        this.recurringpostListConfig = new UniTableBuilder('salarytrans', true)
        .setFilter(this.buildFilter())
        .setColumnMenuVisible(false)
        .setToolbarOptions(['create', 'cancel', 'save'])
        .addColumns(wagetypeIDCol, descriptionCol, employmentIDCol, fromdateCol, todateCol, amountCol, rateCol, sumCol);
    }
    
    private buildFilter() {
        var filter = 'EmployeeNumber eq ' + this.employeeID;
        filter += ' and IsRecurringPost eq true';
        return filter;
    }
}
