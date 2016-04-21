import {
    Component, 
    Input, 
    ViewChildren, 
    Injector, 
    OnInit, 
    EventEmitter, 
    Output, 
    ViewChild, 
    ComponentRef
} from 'angular2/core';

import {RouteParams} from 'angular2/router';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
import {UniFormBuilder, UniFieldBuilder, UniForm} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, FieldType, AGAZone, WageType, PayrollRun, Employment} from '../../../unientities';
import {EmployeeService, AgaZoneService, WageTypeService} from '../../../services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

declare var _;

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html',
    directives: [UniTable, UniComponentLoader],
    providers: [EmployeeService, AgaZoneService, WageTypeService]
})

export class SalaryTransactionEmployeeList implements OnInit {     
    private salarytransEmployeeTableConfig: any;
    private salarytransEmployeeTotalsTableConfig: any;
    private employeeTotals: any[] = [];
    private employments: any[];
    private wagetypes: WageType[] = []; 
    public employee: Employee;
    private agaZone: AGAZone;
    public form: UniFormBuilder = new UniFormBuilder();
    public formModel: any = {};
    private whenFormInstance: Promise<UniForm>;
    
    @ViewChild(UniComponentLoader) private uniCompLoader: UniComponentLoader;
    @Input() private ansattID: number;
    @Input() private payrollRun: PayrollRun;
    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @ViewChildren(UniTable) private tables: any;
    
    private busy: boolean;    
    private runIDcol: UniTableColumn;
    private empIDcol: UniTableColumn;
    
    constructor(public employeeService: EmployeeService, 
                private _agaZoneService: AgaZoneService, 
                private _injector: Injector, 
                private _uniHttpService: UniHttp,
                private _wageTypeService: WageTypeService) {
                    this.agaZone = new AGAZone();
                    this.busy = true;
                    if (!this.ansattID) {
                        let params = this._injector.parent.parent.get(RouteParams);
                        this.ansattID = params.get('id');
                    }
            }
    
    public ngOnInit() {
        this.busy = true;
        
        Observable.forkJoin(
            this.employeeService.getTotals(this.payrollRun.ID, this.ansattID),
            this.employeeService.get(this.ansattID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo']),
            this._wageTypeService.GetAll(''),
            this._uniHttpService.asGET()
                .usingBusinessDomain()
                .withEndPoint('employments')
                .send()
                
        )
        .subscribe((response: any) => {
            let [totals, employee, wagetype, employment] = response;
            this.employments = employment;
            this.wagetypes = wagetype;
            this.createTableConfig();
            this.employeeTotals.push(totals);
            this.employee = employee;
            this.createTotalTableConfig();
            setTimeout(() => {
                this.getAgaAndShowView(false);
            }, 100);
            
            
        }, (error: any) => console.log(error));
    }
    
    public ngOnChanges() {
        this.busy = true;
        if (this.tables && this.ansattID) {
            Observable.forkJoin(            
            this.employeeService.getTotals(this.payrollRun.ID, this.ansattID),
            this.employeeService.get(this.ansattID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo'])
            ).subscribe((response: any) => {
                let [totals, emp] = response;
                this.employeeTotals[0] = totals;
                this.employee = emp;
                this.runIDcol.defaultValue = this.payrollRun.ID;                
                this.empIDcol.defaultValue = this.ansattID;  
                
                let tableConfig = this.salarytransEmployeeTableConfig;
                let totalsConfig = this.salarytransEmployeeTotalsTableConfig;
                tableConfig.schemaModel.fields['EmployeeID'].defaultValue = this.ansattID;
                tableConfig.filter = this.buildFilter();
                
                if (this.payrollRun.StatusCode > 0) {
                    tableConfig.setEditable(false).setToolbarOptions([]);
                } else {
                    tableConfig.setEditable(true).setToolbarOptions(['create', 'cancel']);
                }
                
                this.tables.toArray()[0].updateConfig(tableConfig);
                this.tables.toArray()[1].updateConfig(totalsConfig);  
                
                this.getAgaAndShowView(true);
                
            }, (error: any) => console.log(error));
        }
    }
    
    private getAgaAndShowView(update: boolean) {
        if (this.employee.SubEntity) {
            this._agaZoneService
                .Get(this.employee.SubEntity.AgaZone)
                .subscribe((agaResponse: AGAZone) => {
                    this.agaZone = agaResponse;
                    if (update) {
                        this.formModel.aga = this.agaZone;
                        this.formModel.employee = this.employee;
                        this.whenFormInstance.then((instance: UniForm) => instance.Model = this.formModel);
                    } else {
                        this.createHeadingForm();
                        this.loadForm();
                    }
                    this.busy = false;
                });
        }else {
            this.agaZone = new AGAZone();
            if (update) {
                this.formModel.aga = this.agaZone;
                this.formModel.employee = this.employee;
                this.whenFormInstance.then((instance: UniForm) => instance.Model = this.formModel);
            } else {
                this.createHeadingForm();
                this.loadForm();
            }
            this.busy = false;
        }
    }
    
    private buildFilter() {
        if (this.payrollRun.ID === undefined) {
            return 'EmployeeNumber eq ' + this.ansattID;
        } else {
            return 'EmployeeNumber eq ' + this.ansattID 
            + ' and PayrollRunID eq ' + this.payrollRun.ID;
        }       
        
    }
    
    private createHeadingForm() {
        this.formModel.employee = this.employee;
        this.formModel.aga = this.agaZone;
        var formBuilder = new UniFormBuilder();
        var percent = new UniFieldBuilder();
        percent.setLabel('Prosenttrekk')
            .setModel(this.formModel)
            .setModelField('employee.TaxPercentage')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var subEntity = new UniFieldBuilder();
        subEntity.setLabel('Virksomhet')
            .setModel(this.formModel)
            .setModelField('employee.SubEntity.BusinessRelationInfo.Name')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])
            .hasLineBreak(true);
        
        var tableTax = new UniFieldBuilder();
        tableTax.setLabel('Tabelltrekk')
            .setModel(this.formModel)
            .setModelField('employee.TaxTable')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
        
        var agaZone = new UniFieldBuilder();
        agaZone.setLabel('AGA-sone')
            .setModel(this.formModel)
            .setModelField('aga.ZoneName')
            .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT]);
            
        formBuilder.addUniElements(percent, subEntity, tableTax, agaZone);
        formBuilder.readmode();
        formBuilder.hideSubmitButton();
        this.form = formBuilder;
    }
    
    private createTableConfig() {
        let wagetypeDS: {value: number, text: string} [] = [
            {value: null, text: 'Ikke valgt'}
        ];
        
        let employmentDS: {value: number, text: string}[] = [
            {value: null, text: 'Ikke valgt'}
        ];
        
        this.wagetypes.forEach((item: WageType) => {
            wagetypeDS.push({value: item.WageTypeId, text: item.WageTypeId.toString()});
        });
        
        this.employments.forEach((item: Employment) => {
            employmentDS.push({value: item.ID, text: item.JobName});
        });
        
        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', 'string');
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', 'date');
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', 'date');
        var rateCol = new UniTableColumn('Rate', 'Sats', 'number');
        var amountCol = new UniTableColumn('Amount', 'Antall', 'number');
        var sumCol = new UniTableColumn('Sum', 'Sum', 'number').setCustomEditor('readonlyeditor', null).setEditable(true);
        
        this.runIDcol = new UniTableColumn('PayrollRunID', 'Lønnsavregningsid' ).setHidden(true);
        this.runIDcol.defaultValue = this.payrollRun.ID;
        this.empIDcol = new UniTableColumn('EmployeeID', 'AnsattID' ).setHidden(true);
        this.empIDcol.defaultValue = this.ansattID;

        var employmentidCol = new UniTableColumn('EmploymentID', 'Arbeidsforhold')         
            .setValues(employmentDS)
            .setDefaultValue(null)                            
            .setCustomEditor('dropdown', {
                dataSource: employmentDS,
                dataValueField: 'value',
                dataTextField: 'text'
            }, (item, rowModel) => {
                rowModel.set('EmploymentID', item.value);
                rowModel.set('Employment', _.find(this.employments, emp => emp.ID === item.value));
            });
        var accountCol = new UniTableColumn('Account', 'Konto', 'string');
        var payoutCol = new UniTableColumn('Wagetype$Base_Payment', 'Utbetales', 'bool')
            .setCustomEditor('readonlyeditor', null)
            .setEditable(true)
            .setTemplate((dataItem) => {
                if (dataItem.Wagetype$Base_Payment) {
                    return 'Ja';
                } else {
                    return 'nei';
                }
            });
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', 'bool')
        .setDefaultValue(false)
        .setTemplate((dataItem) => {
            if (dataItem.IsRecurringPost) {
                return 'Fast';
            } else {
                return 'Variabel';
            }
        });
        
        var wageTypeCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', 'number')
            .setValues(wagetypeDS)
            .setDefaultValue(null)                            
            .setCustomEditor('dropdown', {
                dataSource: wagetypeDS,
                dataValueField: 'value',
                dataTextField: 'text'
            }, (item, rowModel) => {
                let wagetype = _.find(this.wagetypes, wt => wt.WageTypeId === item.value);
                rowModel.set('WageTypeNumber', wagetype.WageTypeId);
                rowModel.set('WageTypeId', wagetype.ID);
                rowModel.set('Wagetype', wagetype);
                rowModel.set('Text', wagetype.WageTypeName);
                rowModel.set('FromDate', this.payrollRun.FromDate);
                rowModel.set('ToDate', this.payrollRun.ToDate);
                rowModel.set('Account', wagetype.AccountNumber);
                rowModel.set('Amount', 1);
                rowModel.set('Rate', wagetype.Rate);
                rowModel.set('Sum', rowModel.Rate * rowModel.Amount);
                rowModel.set('Wagetype$Base_Payment', wagetype.Base_Payment);
            });
        
        this.salarytransEmployeeTableConfig = new UniTableBuilder('salarytrans', true)
        .setExpand('@Wagetype')
        .setFilter(this.buildFilter())
        .setPageable(false)
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
            amountCol,
            rateCol,
            sumCol,
            transtypeCol,
            payoutCol
            )
            .addCommands('destroy');
        
        if (this.payrollRun.StatusCode > 0) {
            this.salarytransEmployeeTableConfig.setEditable(false).setToolbarOptions([]);
        } else {
            this.salarytransEmployeeTableConfig.setEditable(true).setToolbarOptions(['create', 'cancel']);
        }
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
