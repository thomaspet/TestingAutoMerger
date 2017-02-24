import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { SalaryBalance, WageType, Employee, Supplier } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { FieldType } from 'uniform-ng2/main';

@Injectable()
export class SalarybalanceService extends BizHttp<SalaryBalance> {

    private defaultExpands: string[] = [];

    constructor(http: UniHttp) {
        super(http);
        this.relativeURL = SalaryBalance.RelativeUrl;
        this.entityType = SalaryBalance.EntityType;
    }

    public getSalarybalance(id: number | string, expand: string[] = null): Observable<any> {
        if (id === 0) {
            if (expand) {
                return this.GetNewEntity(expand, 'salarybalance');
            }
            return this.GetNewEntity(this.defaultExpands, 'salarybalance');
        } else {
            if (expand) {
                return this.Get(id, expand);
            }
            return this.Get(id, this.defaultExpands);
        }
    }

    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }
    
    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public layout(layoutID: string) {
        return Observable.from([
            {
                Name: layoutID,
                BaseEntity: 'salarybalance',
                Fields: [
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'ID',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: true,
                        LookupField: false,
                        Label: 'Nr',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'InstalmentType',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.DROPDOWN,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Type',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'Name',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.TEXT,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Navn',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: true,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'EmployeeID',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.DROPDOWN,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Ansatt',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: {
                            valueProperty: 'EmployeeNumber',
                            template: (employee: Employee) => employee
                                ? `${employee.EmployeeNumber} - ${employee.BusinessRelationInfo.Name}`
                                : ''
                        },
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'WagetypeID',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.DROPDOWN,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Lønnsart',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: {
                            valueProperty: 'WageTypeNumber',
                            template: (wagetype: WageType) => wagetype
                                ? `${wagetype.WageTypeNumber} - ${wagetype.WageTypeName}`
                                : ''
                        },
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'CreatePayment',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.CHECKBOX,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Lag utbetaling',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: true,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'Balance',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Beløp',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'Instalment',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.NUMERIC,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Avdrag',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'InstalmentPercent',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.TEXT,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Avdrag prosent',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: true,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'SupplierID',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.DROPDOWN,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Leverandør',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: {
                            valueProperty: 'SupplierNumber',
                            template: (supplier: Supplier) => supplier
                                ? `${supplier.SupplierNumber} - ${supplier.Info.Name}`
                                : ''
                        },
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'KID',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.TEXT,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Kid',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'Supplier.Info.DefaultBankAccount.AccountNumber',
                        Placement: 1,
                        Hidden: false,
                        FieldType: FieldType.TEXT,
                        ReadOnly: true,
                        LookupField: false,
                        Label: 'Kontonummer',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: null,
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    }
                ]
            }
        ]);
    }
    
}
