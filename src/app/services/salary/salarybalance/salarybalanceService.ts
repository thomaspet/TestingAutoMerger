import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SalaryBalance, WageType, Employee, Supplier, SalBalType, SalBalDrawType} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {FieldType, UniFieldLayout, UniFormError} from '../../../../framework/ui/uniform/index';
import {UniTableColumnType} from '../../../../framework/ui/unitable/index';
import {SalaryBalanceLineService} from './salaryBalanceLineService';
import {ErrorService} from '../../commonServicesModule';
import {URLSearchParams} from '@angular/http';
import {WagetypeDetail} from '@app/components/salary/wagetype/views/wagetypeDetails';
import {ModulusService} from '../../common/modulusService';
import {SimpleChange} from '@angular/core/src/change_detection/change_detection_util';

interface IFieldFunc {
    prop: string;
    func: (field: UniFieldLayout) => any;
}

@Injectable()
export class SalarybalanceService extends BizHttp<SalaryBalance> {

    private defaultExpands: string[] = [];

    private instalmentTypes: {ID: SalBalType, Name: string}[] = [
        {ID: SalBalType.Advance, Name: 'Forskudd'},
        {ID: SalBalType.Contribution, Name: 'Bidragstrekk'},
        {ID: SalBalType.Outlay, Name: 'Utleggstrekk'},
        {ID: SalBalType.Garnishment, Name: 'Påleggstrekk'},
        {ID: SalBalType.Other, Name: 'Andre'}
    ];

    private standardNames: {Type: SalBalType, Name: string}[] = [
        {Type: SalBalType.Advance, Name: 'Forskudd'},
        {Type: SalBalType.Contribution, Name: 'Trekk i lønn'}
    ];

    constructor(
        protected http: UniHttp,
        private salaryBalanceLineService: SalaryBalanceLineService,
        private errorService: ErrorService,
        private modulusService: ModulusService
    ) {
        super(http);
        this.relativeURL = SalaryBalance.RelativeUrl;
        this.entityType = SalaryBalance.EntityType;
    }

    private getName(salarybalance: SalaryBalance): string {
        const standardName = this.standardNames.find(x => x.Type === salarybalance.InstalmentType);
        if (standardName) {
            return standardName.Name;
        } else {
            return this.instalmentTypes.find(x => x.ID === salarybalance.InstalmentType).Name;
        }
    }

    private getHelpText(colname: string) {
        let helpText: string = '';
        switch (colname.toLowerCase()) {
            case 'instalmenttype':
                helpText = 'Velg hvilken type trekk du skal legge inn her. ' +
                'Feltene under vil forandre seg for å tilpasse seg behov for det enkelte trekk. ' +
                'Er det et trekk som ikke passer inn i forhåndsdefinerte valg, så bruk valget Andre. ' +
                'Feltet låses for redigering når lagret';
                break;
            case 'name':
                helpText = 'Teksten i dette feltet vises på lønnsavregning, rapporter og lønnsslipp';
                break;
            case 'wagetypenumber':
                helpText = 'Henter automatisk lønnsart som samsvarer med type som er valgt. ' +
                'Er det blankt så må det fylles ut med lønnsart. ' +
                'Lønnsarten bestemmer hvordan trekket skal håndteres på lønnsavregning. ' +
                'Feltet er påkrevd for å få et trekk til å fungere. Feltet låses for redigering når lagret.';
                break;
            case 'fromdate':
                helpText = 'Bestemmer når trekket blir med på lønnsavregning. ' +
                'Så lenge startdato er innenfor perioden som lønnsavregningen, blir den med med et trekk for en periode. ' +
                'Datoen tar ikke hensyn til datoen i måneden og ' +
                'vil ikke avkorte trekket hvis trekket har startdato midt i perioden som det avregnes lønn for. ' +
                'Datoen kan også brukes til å stoppe trekket for en periode. ' +
                'Da settes startdato lik startdato i den lønnsavregningen en ønsker at neste avdrag skal være med i. ' +
                'Feltet er påkrevd for å lagre trekk.';
                break;
            case 'todate':
                helpText = 'Her kan en stoppe et trekk, uten at saldo blir endret. ' +
                'Saldo vil stå på den ansatte som saldo inntil trekket startes igjen eller til trekket avsluttes med manuell føring.';
                break;
            case 'amount':
                helpText = 'Her legges det inn beløpet som skal utbetales hvis det er ett forskudd. ' +
                'Er det et trekkpålegg med saldo, legges saldoen for hele trekket her. ' +
                'Når avdragene som er trukket når saldo, stoppes trekket automatisk. ' +
                'Er det ingen saldo på trekket, så trekkes det inntil det stoppes med dato. ' +
                'Feltet låses for redigering når lagret.';
                break;
            case 'instalment':
                helpText = 'Her legges det inn avdrag pr lønnsavregning som fast beløp. ' +
                'Avdrag kan redigeres så lenge trekket er aktivt.  Er feltet blankt trekkes hele saldoen på neste lønnsavregning.';
                break;
            case 'instalmentpercent':
                helpText = 'Er trekket et prosenttrekk legges prosenten for trekket inn her. ' +
                'Feltet kan redigeres så lenge trekket er aktivt.';
                break;
            case 'supplierid':
                helpText = 'Kobles mot leverandør for automatisk remittering av trekk når lønnsutbetaling sendes bank. ' +
                'Bankkonto og annen betalingsinfo hentes fra leverandør. ' +
                'For at remittering skal skje må det være krysset for at trekket skal betales automatisk. ' +
                'Firmainnstillinger må også være satt opp med Lag utbetaling av faste trekk (i firmainnstillinger, lønn)';
                break;
            case 'kid':
                helpText = 'For trekk som må ha kidnr ved betaling, legges kidnr inn som en fast opplysning her.';
                break;
            case 'createpayment':
                helpText = 'Lag utbetalingspost til leverandør ved utbetaling av lønnsavregning. ' +
                'Vil bare fungere viss Firmainnstillinger er satt opp med lag utbetaling av faste trekk (i firmainnstillinger, lønn)';
                break;
            default:
                break;
        }

        return helpText;
    }

    public getInstalmentTypes() {
        return this.instalmentTypes;
    }

    public save(salarybalance: SalaryBalance): Observable<SalaryBalance> {
        let refreshLines: boolean;
        return Observable
            .of(salarybalance)
            .map(salBal => {
                if (!salBal.Name) {
                    salBal.Name = this.getName(salBal);
                }
                if (!salBal.ID) {
                    salBal.ID = 0;
                } else {
                    refreshLines = true;
                }

                if (!salBal.KID) {
                    salBal.KID = '0';
                }
                return salBal;
            })
            .map(salBal => this.washSalaryBalance(salBal))
            .switchMap(salBal => salBal.ID
                ? this.Put(salBal.ID, salBal)
                : this.Post(salBal))
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

    public getSalarybalance(id: number | string, expand: string[] = null): Observable<SalaryBalance> {
        if (!id) {
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

    public hasBalance(salaryBalance: SalaryBalance): boolean {
        return salaryBalance.InstalmentType === SalBalType.Advance || salaryBalance.Type !== SalBalDrawType.FixedAmount;
    }

    public washSalaryBalance(salaryBalance: SalaryBalance): SalaryBalance {
        salaryBalance.EmployeeID = salaryBalance.EmployeeID || 0;
        salaryBalance.SupplierID = salaryBalance.SupplierID || 0;
        salaryBalance.WageTypeNumber = salaryBalance.WageTypeNumber || 0;
        salaryBalance.Instalment = salaryBalance.Instalment || 0;
        salaryBalance.InstalmentPercent = salaryBalance.InstalmentPercent || 0;
        salaryBalance.Amount = salaryBalance.Amount || 0;

        return salaryBalance;
    }

    public isHiddenByInstalmentType(salaryBalance: SalaryBalance) {
        return (salaryBalance.InstalmentType !== SalBalType.Contribution)
            && (salaryBalance.InstalmentType !== SalBalType.Outlay)
            && (salaryBalance.InstalmentType !== SalBalType.Other);
    }

    public GetFieldFuncs(salaryBalance: SalaryBalance): IFieldFunc[] {
        return [
            {
                prop: 'Instalment',
                func: instalmentField => instalmentField.ReadOnly = !!salaryBalance.InstalmentPercent
            },
            {
                prop: 'InstalmentPercent',
                func: percentField => percentField.ReadOnly = !!salaryBalance.Instalment
            }
        ];
    }

    public layout(
        layoutID: string,
        salaryBalance: SalaryBalance,
        wageTypes: WageType[],
        employees: Employee[],
        suppliers: Supplier[]
    ) {
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
                        HelpText: this.getHelpText('instalmenttype'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 0,
                        ReadOnly: !!salaryBalance.ID,
                        Options: {
                            source: this.getInstalmentTypes(),
                            displayProperty: 'Name',
                            valueProperty: 'ID',
                            debounceTime: 500
                        },
                        Validations: [
                            (value: number, field: UniFieldLayout) => {
                                if (!!value) {
                                    return;
                                }

                                return {
                                    field: field,
                                    value: value,
                                    errorMessage: 'Type er påkrevd',
                                    isWarning: false};
                                }
                        ]
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Name',
                        FieldType: FieldType.TEXT,
                        Label: 'Tekst til lønnspost',
                        HelpText: this.getHelpText('name'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 1,
                        LineBreak: true,
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'EmployeeID',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Ansatt',
                        FieldSet: 0,
                        Section: 0,
                        Placement: 2,
                        ReadOnly: !!salaryBalance.ID,
                        Options: {
                            source: employees,
                            valueProperty: 'ID',
                            template: (employee: Employee) => employee
                                ? `${employee.EmployeeNumber} - ${employee.BusinessRelationInfo.Name}`
                                : ''
                        },
                        Validations: [
                            (value: number, field: UniFieldLayout) => {
                                if (!!value) {
                                    return;
                                }

                                return {
                                    field: field,
                                    value: value,
                                    errorMessage: 'Ansatt er påkrevd',
                                    isWarning: false};
                                }
                        ]
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'WageTypeNumber',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Lønnsart',
                        HelpText: this.getHelpText('wagetypenumber'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 3,
                        ReadOnly: !!salaryBalance.ID,
                        Options: {
                            source: wageTypes,
                            valueProperty: 'WageTypeNumber',
                            template: (wagetype: WageType) => wagetype
                                ? `${wagetype.WageTypeNumber} - ${wagetype.WageTypeName}`
                                : ''
                        },
                        Validations: [
                            (value: number, field: UniFieldLayout) => {
                                if (!!value) {
                                    return;
                                }

                                return {
                                    field: field,
                                    value: value,
                                    errorMessage: 'Lønnsart er påkrevd',
                                    isWarning: false};
                                }
                        ]
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'FromDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Fra dato',
                        HelpText: this.getHelpText('fromdate'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 4
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'ToDate',
                        FieldType: FieldType.LOCAL_DATE_PICKER,
                        Label: 'Til dato',
                        HelpText: this.getHelpText('todate'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 5
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Amount',
                        FieldType: FieldType.NUMERIC,
                        Label: salaryBalance.InstalmentType === SalBalType.Advance ? 'Beløp' : 'Saldo',
                        HelpText: this.getHelpText('amount'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 6,
                        Hidden: !!salaryBalance.ID || salaryBalance.InstalmentType === SalBalType.Contribution,
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
                        HelpText: this.getHelpText('instalment'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 7,
                        ReadOnly: !!salaryBalance.InstalmentPercent,
                        Options: {
                            format: 'money',
                            decimalLength: 2
                        }
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'InstalmentPercent',
                        FieldType: FieldType.NUMERIC,
                        Label: 'Avdrag prosent',
                        HelpText: this.getHelpText('instalmentpercent'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 8,
                        Options: {
                            format: 'money',
                            decimalLength: 2
                        },
                        ReadOnly: !!salaryBalance.Instalment,
                        Hidden: salaryBalance.InstalmentType === SalBalType.Advance
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'SupplierID',
                        FieldType: FieldType.AUTOCOMPLETE,
                        Label: 'Leverandør',
                        HelpText: this.getHelpText('supplierid'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 9,
                        Hidden: this.isHiddenByInstalmentType(salaryBalance),
                        Options: {
                            source: suppliers,
                            valueProperty: 'ID',
                            template: (supplier: Supplier) => supplier
                                ? `${supplier.SupplierNumber} - ${supplier.Info.Name}`
                                : ''
                        },
                        Validations: [
                            (value: number, field: UniFieldLayout) => {
                                if (!!value) {
                                    return;
                                }

                                return {
                                    field: field,
                                    value: value,
                                    errorMessage: 'Leverandør er påkrevd',
                                    isWarning: false};
                                }
                        ]
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'KID',
                        FieldType: FieldType.TEXT,
                        Label: 'Kid',
                        HelpText: this.getHelpText('kid'),
                        FieldSet: 0,
                        Section: 0,
                        Placement: 10,
                        Options: {},
                        Validations: [
                            (value: string, field: UniFieldLayout) => {
                                if (typeof(value) !== 'string') {
                                    return;
                                }

                                if (field.Hidden || field.ReadOnly || !value || this.modulusService.isValidKID(value)) {
                                    return;
                                }

                                return {
                                    field: field,
                                    value: value,
                                    errorMessage: 'Ugyldig KID',
                                    isWarning: false
                                };
                            }
                        ],
                        Hidden: this.isHiddenByInstalmentType(salaryBalance)
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'Supplier.Info.DefaultBankAccount.AccountNumber',
                        FieldType: FieldType.TEXT,
                        ReadOnly: true,
                        Label: 'Kontonummer',
                        FieldSet: 0,
                        Section: 0,
                        Placement: 11,
                        Options: {},
                        Hidden: this.isHiddenByInstalmentType(salaryBalance)
                    },
                    {
                        EntityType: 'salarybalance',
                        Property: 'CreatePayment',
                        FieldType: FieldType.CHECKBOX,
                        ReadOnly: false,
                        HelpText: this.getHelpText('createpayment'),
                        Label: 'Lag utbetaling',
                        FieldSet: 0,
                        Section: 0,
                        Placement: 12,
                        Options: {},
                        Hidden: this.isHiddenByInstalmentType(salaryBalance)
                    }
                ]
            }
        ]);
    }
}
