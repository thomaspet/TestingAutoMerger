import { Injectable } from '@angular/core';
import { BizHttp } from '../../../../framework/core/http/BizHttp';
import { UniHttp } from '../../../../framework/core/http/http';
import { SalaryBalance, WageType, Employee, Supplier, SalBalType, SalBalDrawType } from '../../../unientities';
import { Observable } from 'rxjs/Observable';
import { FieldType, UniValidationOperators } from '../../../../framework/ui/uniform/index';
import { SalaryBalanceLineService } from './salaryBalanceLineService';
import { ErrorService } from '../../commonServicesModule';
import {URLSearchParams} from '@angular/http';

@Injectable()
export class SalarybalanceService extends BizHttp<SalaryBalance> {

    private defaultExpands: string[] = [];

    private instalmentTypes: { ID: SalBalType, Name: string }[] = [
        { ID: SalBalType.Advance, Name: 'Forskudd' },
        { ID: SalBalType.Contribution, Name: 'Bidragstrekk' },
        { ID: SalBalType.Outlay, Name: 'Utleggstrekk' },
        { ID: SalBalType.Garnishment, Name: 'Påleggstrekk' },
        { ID: SalBalType.Other, Name: 'Andre' }
    ];

    private standardNames: { Type: SalBalType, Name: string }[] = [
        { Type: SalBalType.Advance, Name: 'Forskudd' },
        { Type: SalBalType.Contribution, Name: 'Trekk i lønn' }
    ];

    constructor(
        protected http: UniHttp,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private errorService: ErrorService) {
        super(http);
        this.relativeURL = SalaryBalance.RelativeUrl;
        this.entityType = SalaryBalance.EntityType;
    }

    public getInstalmentTypes() {
        return this.instalmentTypes;
    }

    public save(salarybalance: SalaryBalance): Observable<SalaryBalance> {
        if (!salarybalance.Name) {
            salarybalance.Name = this.getName(salarybalance);
        }
        let refreshLines: boolean;
        if (!salarybalance.ID) {
            salarybalance.ID = 0;
        } else {
            refreshLines = true;
        }

        let saver = salarybalance.ID
            ? this.Put(salarybalance.ID, salarybalance)
            : this.Post(salarybalance);

        return saver
            .switchMap((salbal: SalaryBalance) => refreshLines
                ? this.salaryBalanceLineService
                    .GetAll(`filter=SalaryBalanceID eq ${salbal.ID}`)
                    .map((lines) => {
                        salbal.Transactions = lines;
                        return salbal;
                    })
                : Observable.of(salbal)
            );
    }

    public getInstalment(salarybalance: SalaryBalance) {
        if (salarybalance) {
            return this.instalmentTypes.find(x => x.ID === salarybalance.InstalmentType);
        } else {
            return null;
        }
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

    public getAll(empID: number, expand: string[] = []): Observable<SalaryBalance[]> {
        return super.GetAll(`filter=${empID ? 'EmployeeID eq ' + empID : ''}&expand=${expand.join(',')}`);
    }

    public getPrevious(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID lt ${ID}&top=1&orderBy=ID desc`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getNext(ID: number, expands: string[] = null) {
        return super.GetAll(`filter=ID gt ${ID}&top=1&orderBy=ID`, expands ? expands : this.defaultExpands)
            .map(resultSet => resultSet[0]);
    }

    public getBalance(ID: number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint(this.relativeURL + `/${ID}?action=balance`)
            .send()
            .map(response => response.json());
    }

    private getName(salarybalance: SalaryBalance): string {
        let standardName = this.standardNames.find(x => x.Type === salarybalance.InstalmentType);
        if (standardName) {
            return standardName.Name;
        } else {
            return this.instalmentTypes.find(x => x.ID === salarybalance.InstalmentType).Name;
        }
    }

    public hasBalance(salaryBalance: SalaryBalance): boolean {
        return salaryBalance.InstalmentType === SalBalType.Advance || salaryBalance.Type !== SalBalDrawType.FixedAmount;
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
                        Placement: 2,
                        Hidden: false,
                        FieldType: FieldType.TEXT,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Tekst til lønnspost',
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
                        Placement: 3,
                        Hidden: false,
                        FieldType: FieldType.AUTOCOMPLETE,
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
                        Property: 'WageTypeNumber',
                        Placement: 4,
                        Hidden: false,
                        FieldType: FieldType.AUTOCOMPLETE,
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
                        Property: 'FromDate',
                        Placement: 5,
                        Hidden: false,
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Fra dato',
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
                        Property: 'ToDate',
                        Placement: 6,
                        Hidden: false,
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Til dato',
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
                        Property: 'Amount',
                        Placement: 7,
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
                        Placement: 8,
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
                        Placement: 9,
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
                        LineBreak: null,
                        Combo: null,
                        Sectionheader: ''
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'SupplierID',
                        Placement: 10,
                        Hidden: false,
                        FieldType: FieldType.AUTOCOMPLETE,
                        ReadOnly: false,
                        LookupField: false,
                        Label: 'Leverandør',
                        Description: null,
                        HelpText: null,
                        FieldSet: 0,
                        Section: 0,
                        Placeholder: null,
                        Options: {
                            valueProperty: 'ID',
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
                        Placement: 11,
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
                        Placement: 12,
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
                    },
                    {
                        ComponentLayoutID: 1,
                        EntityType: 'salarybalance',
                        Property: 'CreatePayment',
                        Placement: 13,
                        Hidden: false,
                        FieldType: FieldType.CHECKBOX,
                        ReadOnly: true,
                        LookupField: false,
                        Label: 'Utbetales til leverandør ved lønnsutbetaling',
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
