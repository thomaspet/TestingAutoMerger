import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryBalance, WageType, Employee, Supplier, SalBalType, SalBalDrawType} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType, UniValidationOperators} from '../../../../framework/ui/uniform/index';
import {UniTableColumnType} from '../../../../framework/ui/unitable/index';
import {SalaryBalanceLineService} from './salaryBalanceLineService';
import {ErrorService} from '../../commonServicesModule';
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

        if(!salarybalance.KID) {
            salarybalance.KID = '0';
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
                        EntityType: 'salarybalance',
                        Property: 'InstalmentType',
                        FieldType: FieldType.DROPDOWN,
                        Label: 'Type',
                        FieldSet: 0,
                        Section: 0,
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Name',
                        FieldType: FieldType.TEXT,
                        Label: 'Tekst til lønnspost',
                        FieldSet: 0,
                        Section: 0,
                        LineBreak: true,
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'EmployeeID',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Ansatt',
                        FieldSet: 0,
                        Section: 0,
                        Options: {
                            valueProperty: 'ID',
                            template: (employee: Employee) => employee
                                ? `${employee.EmployeeNumber} - ${employee.BusinessRelationInfo.Name}`
                                : ''
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'WageTypeNumber',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Lønnsart',
                        FieldSet: 0,
                        Section: 0,
                        Options: {
                            valueProperty: 'WageTypeNumber',
                            template: (wagetype: WageType) => wagetype
                                ? `${wagetype.WageTypeNumber} - ${wagetype.WageTypeName}`
                                : ''
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'FromDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Fra dato',
                        FieldSet: 0,
                        Section: 0
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'ToDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Til dato',
                        FieldSet: 0,
                        Section: 0
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Amount',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Beløp',
                        FieldSet: 0,
                        Section: 0,
                        Options: {
                            format: 'money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Instalment',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Avdrag',
                        FieldSet: 0,
                        Section: 0,
                        Options: {
                            format: 'money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'InstalmentPercent',
                        FieldType: FieldType.TEXT,
                        Label: 'Avdrag prosent',
                        FieldSet: 0,
                        Section: 0
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'SupplierID',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Leverandør',
                        FieldSet: 0,
                        Section: 0,
                        Options: {
                            valueProperty: 'ID',
                            template: (supplier: Supplier) => supplier
                                ? `${supplier.SupplierNumber} - ${supplier.Info.Name}`
                                : ''
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'KID',
                        FieldType: FieldType.TEXT,
                        Label: 'Kid',
                        FieldSet: 0,
                        Section: 0
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Supplier.Info.DefaultBankAccount.AccountNumber',
                        FieldType: FieldType.TEXT,
                        ReadOnly: true,
                        Label: 'Kontonummer',
                        FieldSet: 0,
                        Section: 0
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'CreatePayment',
                        FieldType: FieldType.CHECKBOX,
                        ReadOnly: true,
                        HelpText: 'Lag utbetalingspost til leverandør ved utbetaling av lønnsavregning',
                        Label: 'Lag utbetaling',
                        FieldSet: 0,
                        Section: 0
                    }
                ]
            }
        ]);
    }

}
