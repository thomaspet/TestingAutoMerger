import {Component, Input, ViewChildren, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {UniFormBuilder} from '../../../../framework/forms';
import {UniComponentLoader} from '../../../../framework/core';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../../framework/core/http/http';
import {Employee, FieldType, AGAZone, WageType, PayrollRun, Employment} from '../../../unientities';
import {EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService} from '../../../services/services';
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
    providers: [EmployeeService, AgaZoneService, WageTypeService, SalaryTransactionService],
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
    @ViewChildren(UniTable) public tables: any;
    @Output() public salarytransesAdded: EventEmitter<any> = new EventEmitter<any>();

    private busy: boolean;
    private salarytransChanged: any[] = [];
    private salarytransItems$: Observable<any>;
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
        private _wageTypeService: WageTypeService,
        private salarytransService: SalaryTransactionService) {
        
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
            this.employeeService.get(this.employeeID, ['BusinessRelationInfo, SubEntity.BusinessRelationInfo'])
            .subscribe((response: any) => {
                this.employee = response;
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
        done('Lagrer lønnsposter');
        let saveItems: any[] = this.salarytransChanged;

        saveItems.forEach(salaryitem => {
            salaryitem.EmployeeID = this.employeeID;
            salaryitem.EmployeeNumber = this.employeeID;
            salaryitem.PayrollRunID = this.payrollRun.ID;

            if (salaryitem.ID > 0) {
                this.salarytransService.Put(salaryitem.ID, salaryitem)
                .subscribe((response: any) => {
                    done('Sist lagret: ');
                    this.salarytransChanged = [];
                    this.saveactions[0].disabled = true;
                    this.salarytransesAdded.emit(false);
                },
                (err) => {
                    done('Feil ved oppdatering av lønnspost', err);
                });
            } else {
                this.salarytransService.Post(salaryitem)
                .subscribe((response: any) => {
                    done('Sist lagret: ');
                    this.salarytransChanged = [];
                    this.saveactions[0].disabled = true;
                    this.salarytransesAdded.emit(false);
                },
                (err) => {
                    done('Feil ved lagring av lønnspost', err);
                });
            }
        });
        done('Lønnsposter lagret: ');
    }

    public ready(value) {
        
    }
    
    public change(value) {
        
    }

    public isDirty(): boolean {
        return (this.salarytransChanged.length > 0);
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
        var wagetypenameCol = new UniTableColumn('Text', 'Tekst', UniTableColumnType.Text);
        var fromdateCol = new UniTableColumn('FromDate', 'Fra dato', UniTableColumnType.Date);
        var toDateCol = new UniTableColumn('ToDate', 'Til dato', UniTableColumnType.Date);
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
        var amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        var sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number);
        var employmentidCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
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
        var accountCol = new UniTableColumn('Account', 'Konto', UniTableColumnType.Text);
        var payoutCol = new UniTableColumn('Wagetype$Base_Payment', 'Utbetales', UniTableColumnType.Number)
            .setTemplate((dataItem) => {
                if (dataItem.Wagetype$Base_Payment) {
                    return 'Ja';
                } else {
                    return 'Nei';
                }
            });
        var transtypeCol = new UniTableColumn('IsRecurringPost', 'Fast/Variabel post', UniTableColumnType.Number)
            .setTemplate((dataItem) => {
                if (dataItem.IsRecurringPost) {
                    return 'Fast';
                } else {
                    return 'Variabel';
                }
            });

        var wageTypeCol = new UniTableColumn('WageTypeNumber', 'Lønnsart', UniTableColumnType.Lookup)
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
            .setColumns([
                wageTypeCol, wagetypenameCol, employmentidCol,
                fromdateCol, toDateCol, accountCol, amountCol, rateCol, sumCol,
                transtypeCol, payoutCol
            ])
            .setPageable(false)
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === 'WageTypeNumber') {
                    this.mapWagetypeToTrans(row);
                }
                
                if (event.field === 'Employment') {

                    this.mapEmploymentToTrans(row);
                }
                
                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                return row;
            });
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
    }

    private mapWagetypeToTrans(rowModel) {
        let wagetype: WageType = rowModel['WageTypeNumber'];
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

        this.salarytransItems$ = this._uniHttpService.asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({
                filter: filter,
                expand: '@Wagetype'
            });

        this.employeeService.getTotals(this.payrollRun.ID, this.employeeID)
        .subscribe((response) => {
            this.employeeTotals = [response];
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
        let row = event.rowModel;

        if (this.salarytransChanged.length > 0) {
            for (var i = 0; i < this.salarytransChanged.length; i++) {
                var salaryItem = this.salarytransChanged[i];
                if (row.ID === salaryItem.ID) {
                    this.salarytransChanged[i] = row;
                    break;
                } else {
                    this.salarytransChanged.push(row);
                }
            }
        } else {
            this.salarytransChanged.push(row);
        }
        this.salarytransesAdded.emit(true);
        this.saveactions[0].disabled = false;
    }
}
