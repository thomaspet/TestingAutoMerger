import {Component, Input, ViewChildren, Injector, OnInit, EventEmitter, Output, ViewChild, ComponentRef} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {UniFormBuilder, UniFieldBuilder, UniForm} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, FieldType, AGAZone} from '../../../unientities';
import {EmployeeService, AgaZoneService} from '../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html',
    directives: [UniTable],
    providers: [EmployeeService, AgaZoneService]
})

export class SalaryTransactionEmployeeList implements OnInit {     
    private salarytransEmployeeTableConfig: any;
    private salarytransEmployeeTotalsTableConfig: any;
    private employeeTotals: any[] = [];
    private employments: any[];
    public employee: Employee;
    public form: UniFormBuilder = new UniFormBuilder();
    private whenFormInstance: Promise<UniForm>;
    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    private agaZone: AGAZone;
    @Input() private ansattID: number;
    @Input() private payrollRunID: number;
    @Output()
    public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output()
    public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @ViewChildren(UniTable) private tables: any;
    
    private busy: boolean;    
    private runIDcol: UniTableColumn;
    private empIDcol: UniTableColumn;
    
    constructor(public employeeService: EmployeeService, 
                private _agaZoneService: AgaZoneService, 
                private injector: Injector, 
                private uniHttpService: UniHttp) {
                    this.busy = true;
                    if (!this.ansattID) {
                        let params = this.injector.parent.parent.get(RouteParams);
                        this.ansattID = params.get('id');
                    }
            }
    
    public ngOnInit() {
        this.busy = true;
        this.uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('employments')
        .send()
        .subscribe((response) => {
            this.employments = response;
            this.createTableConfig();
        });
        
        
        Observable.forkJoin(
            this.employeeService.getTotals(this.payrollRunID, this.ansattID),
            this.employeeService.get(this.ansattID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo'])
        )
        .subscribe((response: any) => {
            let [totals, emp] = response;
            this.employeeTotals.push(totals);
            console.log('totals: ' + JSON.stringify(this.employeeTotals));
            this.employee = emp;
            console.log('Employee: ' + JSON.stringify(this.employee.SubEntity));
            this.createTotalTableConfig();
            this.tables.toArray()[0].hideColumn('PayrollRunID');
            this.tables.toArray()[0].hideColumn('EmployeeID');
            if (this.employee.SubEntity) {
                this._agaZoneService
                .Get(this.employee.SubEntity.AgaZone)
                .subscribe((agaResponse: AGAZone) => {
                    this.agaZone = response;
                    this.createHeadingForm();
                    this.busy = false;
                });
            }
            
        }, (error: any) => console.log(error));
    }
    
    public ngOnChanges() {
        this.busy = true;
        if (this.tables && this.ansattID) {         
            // this.calculateTotals();
            
            Observable.forkJoin(            
            this.employeeService.getTotals(this.payrollRunID, this.ansattID),
            this.employeeService.get(this.ansattID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo'])
        ).subscribe((response: any) => {
            let [totals, emp] = response;
            this.employeeTotals[0] = totals;
            this.employee = emp;
            this.runIDcol.defaultValue = this.payrollRunID;                
            this.empIDcol.defaultValue = this.ansattID;  
            
            let tableConfig = this.salarytransEmployeeTableConfig;
            let totalsConfig = this.salarytransEmployeeTotalsTableConfig;
            tableConfig.schemaModel.fields['EmployeeID'].defaultValue = this.ansattID;
            tableConfig.filter = this.buildFilter();
            
            this.tables.toArray()[0].updateConfig(tableConfig);
            this.tables.toArray()[0].hideColumn('PayrollRunID');
            this.tables.toArray()[0].hideColumn('EmployeeID');
            this.tables.toArray()[1].updateConfig(totalsConfig);  
            
            this.busy = false;
            
        }, (error: any) => console.log(error));
            
            // this.runIDcol.defaultValue = this.payrollRunID;                
            // this.empIDcol.defaultValue = this.ansattID; 
            // this.empIDcol.setDefaultValue(this.ansattID);
              
           
        }        
    }
    
    
    private buildFilter() {
        if (this.payrollRunID === undefined) {
            return 'EmployeeNumber eq ' + this.ansattID;
        } else {
            return 'EmployeeNumber eq ' + this.ansattID 
            + ' and PayrollRunID eq ' + this.payrollRunID;
        }       
        
    }
    
    private createHeadingForm() {
        console.log('creating form');
        var formBuilder = new UniFormBuilder();
        var percent = new UniFieldBuilder();
        percent.setLabel('Prosenttrekk')
            .setModel(this.employee)
            .setModelField('TaxPercentage')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var subEntity = new UniFieldBuilder();
        subEntity.setLabel('Virksomhet')
            .setModel(this.employee)
            .setModelField('SubEntity.BusinessRelation.Name')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var tableTax = new UniFieldBuilder();
        tableTax.setLabel('Tabelltrekk')
            .setModel(this.employee)
            .setModelField('TaxTable')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        var agaZone = new UniFieldBuilder();
        agaZone.setLabel('AGA-sone')
            .setModel(this.agaZone)
            .setModelField('ZoneName')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        formBuilder.addUniElements(percent, subEntity, tableTax, agaZone);
        this.form = formBuilder;
    }
    
    private createTableConfig() {
        // var wagetypeidCol = new UniTableColumn('Wagetype.WageTypeNumber', 'Lønnsart', 'string');
        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', 'string');
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', 'date');
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', 'date');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var sumCol = new UniTableColumn('Sum', 'Beløp', 'number');
        
        this.runIDcol = new UniTableColumn('PayrollRunID', 'Lønnsavregningsid' ).setHidden(true);
        this.runIDcol.defaultValue = this.payrollRunID;
        this.empIDcol = new UniTableColumn('EmployeeID', 'AnsattID' ).setHidden(true);
        this.empIDcol.defaultValue = this.ansattID;

        var employmentidCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold')         
            .setTemplate((dataItem) => {
                return this.getEmploymentName(dataItem.EmploymentID);
            });
        var accountCol = new UniTableColumn('Account', 'Konto', 'string');
        /*var payoutCol = new UniTableColumn('Wagetype.Base_Payment', 'Utbetales', 'bool')
            .setTemplate((dataItem) => {
                payoutCol = new UniTableColumn('Wagetype.Base_Payment', 'Utbetales', 'bool');
                if(dataItem.Wagetype.Base_Payment){
                    return 'Ja';
                } else {
                    return 'nei';
                }
            });*/
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', 'bool')
        .setTemplate((dataItem) => {
            accountCol = new UniTableColumn('Account', 'Konto', 'string');
            transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', 'bool');
            if (dataItem.IsRecurringPost) {
                return 'Fast';
            } else {
                return 'Variabel';
            }
        });
        
        var wageTypeCol = new UniTableColumn('WageTypeNumber', 'Lønnsart');
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder('salarytrans', true)
        .setExpand('@Wagetype')
        .setFilter(this.buildFilter())
        .setPageable(false)
        .setToolbarOptions(['create', 'cancel'])
        .setFilterable(false)
        .setColumnMenuVisible(false)
        .setSearchable(false)
        .addColumns(
            this.runIDcol,
            this.empIDcol,
            wageTypeCol,                         
            wagetypenameCol,
            employmentidCol,
            fromdateCol,
            toDateCol,
            accountCol,
            rateCol,
            amountCol,
            sumCol,
            transtypeCol
           // payoutCol
            )
            .addCommands('destroy');
    }
    
    private calculateTotals() {
        this.busy = true;
        Observable.forkJoin(            
            this.employeeService.getTotals(this.payrollRunID, this.ansattID)
        ).subscribe((response: any) => {
            let [totals] = response;
            this.employeeTotals = totals;
            this.runIDcol.defaultValue = this.payrollRunID;                
            this.empIDcol.defaultValue = this.ansattID;    
            
            this.busy = false;
            
        }, (error: any) => console.log(error));
    }
    
    private createTotalTableConfig() {
        var percentCol = new UniTableColumn('percentTax', 'Prosenttrekk', 'string');
        var taxtableCol = new UniTableColumn('tableTax', 'Tabelltrekk', 'string');
        var paidCol = new UniTableColumn('netPayment', 'Utbetalt beløp', 'number');
        var agaCol = new UniTableColumn('baseAGA', 'Beregnet AGA', 'number');
        var basevacationCol = new UniTableColumn('baseVacation', 'Grunnlag feriepenger', 'number'); 
        
        this.salarytransEmployeeTotalsTableConfig = new UniTableBuilder(this.employeeTotals, false)
        .setFilterable(false)
        .setColumnMenuVisible(false)
        .setSearchable(false)
        .setPageable(false)
        .addColumns(percentCol, taxtableCol, paidCol, agaCol, basevacationCol);
    }
    
    private getEmploymentName(employmentID: number) {
        var name = '';
        for (var i = 0; i < this.employments.length; i++) {
            var employment = this.employments[i];
            if (employment.ID === employmentID) {
                name = employment.JobName;
                break;
            }
        }
        return name;
    }
    
    private loadForm() {
        this.uniCompLoader.load(UniForm).then((cmp: ComponentRef) => {
            cmp.instance.config = this.form;
            this.whenFormInstance = new Promise((resolve: Function) => resolve(cmp.instance));
        });
    }
    
    public getNext() {
        this.nextEmployee.emit(this.ansattID);
    }
    
    public getPrevious() {
        this.previousEmployee.emit(this.ansattID);
    }
}
