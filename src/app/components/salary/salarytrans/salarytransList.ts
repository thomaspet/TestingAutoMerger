import {Component, Input, ViewChildren, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {UniFormBuilder} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, FieldType, AGAZone, WageType, PayrollRun, Employment} from '../../../unientities';
import {EmployeeService, AgaZoneService, WageTypeService} from '../../../services/services';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {AsyncPipe} from '@angular/common';
import {UniTable, UniTableColumnType, UniTableColumn, UniTableConfig} from 'unitable-ng2/main';
import {UniForm} from '../../../../framework/uniform';
import {UniFieldLayout} from '../../../../framework/uniform/index';

declare var _;

@Component({
    selector: 'salary-transactions-employee',
    templateUrl: 'app/components/salary/salarytrans/salarytransList.html',
    directives: [UniTable, UniComponentLoader, UniSave, UniForm],
    providers: [EmployeeService, AgaZoneService, WageTypeService],
    pipes: [AsyncPipe]
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
    
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    @Input() private employeeID: number;
    @Input() private payrollRun: PayrollRun;
    @Output() public nextEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @Output() public previousEmployee: EventEmitter<any> = new EventEmitter<any>(true);
    @ViewChildren(UniTable) private tables: any;

    private busy: boolean;
    private runIDcol: UniTableColumn;
    private empIDcol: UniTableColumn;
    private salarytransChanged: any[];
    private salarytransItems$: Observable<any>;
    private salarytransTotals$: Observable<any>;
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre lønnsposter',
            action: this.saveSalarytrans.bind(this),
            main: true,
            disabled: true
        }
    ];

    constructor(
        public employeeService: EmployeeService,
        private _agaZoneService: AgaZoneService,
        private rootRouteParams: RootRouteParamsService,
        private _uniHttpService: UniHttp,
        private _wageTypeService: WageTypeService) {
        
        this.config = {
            submitText: ''
        };

        this.agaZone = new AGAZone();
        this.busy = true;
    }

    public ngOnInit() {
        this.busy = true;
        this.createTableConfig();
        this.createTotalTableConfig();

        Observable.forkJoin(
            // this.employeeService.getTotals(this.payrollRun.ID, this.employeeID),
            this.employeeService.get(this.employeeID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo']),
            this._wageTypeService.GetAll(''),
            this._uniHttpService.asGET()
                .usingBusinessDomain()
                .withEndPoint('employments')
                .send()
        ).subscribe((response: any) => {
            let [employee, wagetype, employment] = response;
            this.employments = employment;
            this.wagetypes = wagetype;
            
            // this.employeeTotals.push(totals);
            // console.log('totals array', totals);
            this.employee = employee;
            this.setUnitableSource();
            
            setTimeout(() => {
                this.getAgaAndShowView(false);
            }, 100);
        }, (error: any) => console.log(error));
    }

    public ngOnChanges() {
        this.busy = true;
        if (this.tables && this.employeeID) {
            Observable.forkJoin(
                this.employeeService.getTotals(this.payrollRun.ID, this.employeeID),
                this.employeeService.get(this.employeeID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo'])
            ).subscribe((response: any) => {
                let [totals, emp] = response;
                this.employeeTotals[0] = totals;
                this.employee = emp;
                // this.runIDcol.defaultValue = this.payrollRun.ID;
                // this.empIDcol.defaultValue = this.employeeID;

                // let tableConfig: UniTableConfig = this.salarytransEmployeeTableConfig;
                // let totalsConfig: UniTableConfig = this.salarytransEmployeeTotalsTableConfig;
                // tableConfig.schemaModel.fields['EmployeeID'].defaultValue = this.employeeID;
                // tableConfig.setFilters() = this.buildFilter();

                // if (this.payrollRun.StatusCode > 0) {
                //     tableConfig.setEditable(false).setToolbarOptions([]);
                // } else {
                //     tableConfig.setEditable(true).setToolbarOptions(['create', 'cancel']);
                // }

                // this.tables.toArray()[0].updateConfig(tableConfig);
                // this.tables.toArray()[1].updateConfig(totalsConfig);
                this.setUnitableSource();
                this.getAgaAndShowView(true);

            }, (error: any) => console.log(error));
        }
    }

    public getNext() {
        this.nextEmployee.emit(this.employeeID);
    }

    public getPrevious() {
        this.previousEmployee.emit(this.employeeID);
    }

    public saveSalarytrans(done) {
        console.log('lagring...');
        done('Lagring er enda ikkje på plass, men det kommer snart..');
    }

    public ready(value) {
        console.log('form ready', value);
    }
    
    public change(value) {
        console.log('uniform changed', value);
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
                        this.fields = _.cloneDeep(this.fields);
                    } else {
                        this.createHeadingForm();
                    }
                    this.busy = false;
                });
        } else {
            this.agaZone = new AGAZone();
            if (update) {
                this.formModel.aga = this.agaZone;
                this.formModel.employee = this.employee;
                this.fields = _.cloneDeep(this.fields);
            } else {
                this.createHeadingForm();
            }
            this.busy = false;
        }
    }

    private buildFilter() {
        if (this.payrollRun.ID === undefined) {
            return 'EmployeeNumber eq ' + this.employeeID;
        } else {
            return 'EmployeeNumber eq ' + this.employeeID
                + ' and PayrollRunID eq ' + this.payrollRun.ID;
        }

    }

    private createHeadingForm() {
        this.formModel.employee = this.employee;
        this.formModel.aga = this.agaZone;
        
        var percent = new UniFieldLayout();
        percent.Label = 'Prosenttrekk';
        percent.Property = 'employee.TaxPercentage';
        percent.FieldType = FieldType.TEXT;
        percent.ReadOnly = true;

        var subEntity = new UniFieldLayout();
        subEntity.Label = 'Virksomhet';
        subEntity.Property = 'employee.SubEntity.BusinessRelationInfo.Name';
        subEntity.FieldType = FieldType.TEXT;
        subEntity.ReadOnly = true;

        var tableTax = new UniFieldLayout();
        tableTax.Label = 'Tabelltrekk';
        tableTax.Property = 'employee.TaxTable';
        tableTax.FieldType = FieldType.TEXT;
        tableTax.ReadOnly = true;

        var agaZone = new UniFieldLayout();
        agaZone.Label = 'AGA-sone';
        agaZone.Property = 'aga.ZoneName';
        agaZone.FieldType = FieldType.TEXT;
        agaZone.ReadOnly = true;
        
        this.fields = [percent, subEntity, tableTax, agaZone];
    }

    private createTableConfig() {
        // let wagetypeDS: { value: number, text: string }[] = [
        //     { value: null, text: 'Ikke valgt' }
        // ];

        // let employmentDS: { value: number, text: string }[] = [
        //     { value: null, text: 'Ikke valgt' }
        // ];

        // this.wagetypes.forEach((item: WageType) => {
        //     wagetypeDS.push({ value: item.WageTypeId, text: item.WageTypeId.toString() });
        // });

        // this.employments.forEach((item: Employment) => {
        //     employmentDS.push({ value: item.ID, text: item.JobName });
        // });

        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date);
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date);
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
            // .setCustomEditor('numericeditor', {}, (item, rowModel) => {
            // rowModel.set('Sum', item * rowModel.Amount);
        // });
        var amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
            // .setCustomEditor('numericeditor', {}, (item, rowModel) => {
            // rowModel.set('Sum', item * rowModel.Rate);
        // });
        var sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number);
            // .setCustomEditor('readonlyeditor', null).setEditable(true);

        this.runIDcol = new UniTableColumn('PayrollRunID', 'Lønnsavregningsid'); // .setHidden(true);
        // this.runIDcol.defaultValue = this.payrollRun.ID;
        this.empIDcol = new UniTableColumn('EmployeeID', 'AnsattID'); // .setHidden(true);
        // this.empIDcol.defaultValue = this.employeeID;

        var employmentidCol = new UniTableColumn('EmploymentLookup', 'Arbeidsforhold')
            .setTemplate((dataItem) => {
                return this.getEmploymentJobName(dataItem.EmploymentID);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    let matching: Employment[] = [];
                    this.employments.forEach(employment => {
                        if (employment.JobName.toLowerCase().indexOf(searchValue) > -1) {
                            matching.push(employment);
                        }
                    });
                    return matching;
                }
            });
            // .setValues(employmentDS)
            // .setDefaultValue(null)
            // .setCustomEditor('dropdown', {
            //     dataSource: employmentDS,
            //     dataValueField: 'value',
            //     dataTextField: 'text'
            // }, (item, rowModel) => {
            //     rowModel.set('EmploymentID', item.value);
            //     rowModel.set('Employment', _.find(this.employments, emp => emp.ID === item.value));
            // });
        var accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text);
        var payoutCol = new UniTableColumn('Wagetype$Base_Payment', 'Utbetales', UniTableColumnType.Number)
            // .setCustomEditor('readonlyeditor', null)
            // .setEditable(true)
            .setTemplate((dataItem) => {
                if (dataItem.Wagetype$Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', UniTableColumnType.Number)
            // .setDefaultValue(false)
            .setTemplate((dataItem) => {
                if (dataItem.IsRecurringPost) {
                    return 'Fast';
                } else {
                    return 'Variabel';
                }
            });

        var wageTypeCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', UniTableColumnType.Number)
            .setTemplate((dataItem) => {
                return this.getWagetypeName(dataItem.WageTypeNumber);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.WageTypeId + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    let matching: WageType[] = [];
                    this.wagetypes.forEach(wagetype => {
                        if (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1) {
                            matching.push(wagetype);
                        }
                    });
                    return matching;
                }
            });

        this.salarytransEmployeeTableConfig = new UniTableConfig()
            // .setExpand('@Wagetype')
            // .setFilter(this.buildFilter())
            // .setPageable(false)
            // .setFilterable(false)
            // .setColumnMenuVisible(false)
            // .setSearchable(false)
            .setColumns([
                // this.runIDcol, this.empIDcol, 
                wageTypeCol, wagetypenameCol, employmentidCol,
                fromdateCol, toDateCol, accountCol, amountCol, rateCol, sumCol,
                transtypeCol, payoutCol
            ])
            .setPageable(false)
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === 'WageType') {
                    this.mapWagetypeToTrans(row);
                }
                
                if (event.field === 'EmploymentLookup') {
                    this.mapEmploymentToTrans(row);
                }
                
                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                return row;
            });
            // .addCommands('destroy');

        // if (this.payrollRun.StatusCode > 0) {
        //     this.salarytransEmployeeTableConfig.setEditable(false).setToolbarOptions([]);
        // } else {
        //     this.salarytransEmployeeTableConfig.setEditable(true).setToolbarOptions(['create', 'cancel']);
        // }
    }

    private createTotalTableConfig() {
        var percentCol = new UniTableColumn('percentTax', 'Prosenttrekk', UniTableColumnType.Number);
        var taxtableCol = new UniTableColumn('tableTax', 'Tabelltrekk', UniTableColumnType.Number);
        var paidCol = new UniTableColumn('netPayment', 'Utbetalt beløp', UniTableColumnType.Number);
        var agaCol = new UniTableColumn('baseAGA', 'Beregnet AGA', UniTableColumnType.Number);
        var basevacationCol = new UniTableColumn('baseVacation', 'Grunnlag feriepenger', UniTableColumnType.Number);

        this.salarytransEmployeeTotalsTableConfig = new UniTableConfig()
        .setColumns([
            percentCol, taxtableCol, paidCol, agaCol, basevacationCol
        ])
        .setEditable(false)
        .setPageable(false)
        .setSearchable(false);
        // this.salarytransEmployeeTotalsTableConfig = new UniTableBuilder(this.employeeTotals, false)
        //     .setFilterable(false)
        //     .setColumnMenuVisible(false)
        //     .setSearchable(false)
        //     .setPageable(false)
        //     .addColumns(percentCol, taxtableCol, paidCol, agaCol, basevacationCol);
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['WageType'];
        if (!wagetype) {
            return;
        }
        rowModel['WagetypeId'] = wagetype.ID;
        rowModel['WageTypeNumber'] = wagetype.WageTypeId;
        rowModel['Wagetype'] = wagetype;
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['FromDate'] = this.payrollRun.FromDate;
        rowModel['ToDate'] = this.payrollRun.ToDate;
        rowModel['Wagetype$Base_Payment'] = wagetype.Base_Payment;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;
        this.calcItem(rowModel);
    }
    
    private mapEmploymentToTrans(rowModel) {
        let employment = rowModel['Employment'];
        if (!employment) {
            return;
        }
        rowModel['EmploymentID'] = employment.ID;
    }
    
    private calcItem(rowModel) {
        let sum = rowModel['Amount'] * rowModel['Rate'];
        rowModel['Sum'] = sum;
    }

    private setUnitableSource() {
        var filter = this.buildFilter();
        console.log('filter', filter);

        this.salarytransItems$ = this._uniHttpService.asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({
                filter: filter,
                expand: '@Wagetype'
            });

        this._uniHttpService.asGET()
        .usingBusinessDomain()
        .withEndPoint('salarytrans')
        .send({
            filter: filter,
            expand: '@Wagetype'
        }).subscribe((response) => {
            console.log('resourcedata', response);
        });
        
        this.salarytransTotals$ = this.employeeService.getTotals(this.payrollRun.ID, this.employeeID);
        


        this.employeeService.getTotals(this.payrollRun.ID, this.employeeID)
        .subscribe((response) => {
            response._links = {};
            this.employeeTotals[0] = response;

            console.log('salarytotalresource', response);
            console.log('employeetotals', JSON.stringify(this.employeeTotals));
        });
    }

    private getEmploymentJobName(employmentID: number) {
        var jobName = '';

        this.employments.forEach((employment: Employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
            }
        });
        return jobName;
    }

    private getWagetypeName(wagetypeNumber: number) {
        var wagetypeName = '';
         
        this.wagetypes.forEach((wagetype: WageType) => {
            if (wagetype.WageTypeId === wagetypeNumber) {
                wagetypeName = wagetype.WageTypeName;
            }
        });
        
        return wagetypeName;
    }

    private rowChanged(event) {
        this.salarytransChanged = this.tables[0].getTableData();
        this.saveactions[0].disabled = false;
    }
}
