import { Injectable, SimpleChanges } from '@angular/core';
import { SalaryBalance, SalBalType, SalaryBalanceTemplate, WageType, Employee, Supplier, SalBalDrawType, Employment } from '@uni-entities';
import { BizHttp, UniHttp, RequestMethod } from '@uni-framework/core/http';
import { FieldType, UniComponentLayout, UniFieldLayout, UniForm } from '@uni-framework/ui/uniform';
import { UniModalService } from '@uni-framework/uni-modal/modalService';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EmployeeService } from '@app/services/salary/employee/employeeService';
import { EmploymentService } from '@app/services/salary/employee/employmentService';
import { SalarybalanceTemplateService } from '@app/services/salary/salarybalanceTemplate/salarybalanceTemplateService';
import { SalaryTransactionService } from '@app/services/salary/salaryTransaction/salaryTransactionService';
import { WageTypeService } from '@app/services/salary/wageType/wageTypeService';
import { SalaryBalanceLineService } from '@app/services/salary/salarybalance/salaryBalanceLineService';
import { ConfirmActions } from '@uni-framework/uni-modal/interfaces';
import { ErrorService } from '@app/services/common/errorService';
import { ModulusService } from '@app/services/common/modulusService';
import { SupplierService } from '@app/services/accounting/supplierService';
import { StatisticsService } from '@app/services/common/statisticsService';


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
        {ID: SalBalType.Garnishment, Name: 'Utleggstrekk skatt'},
        {ID: SalBalType.Union, Name: 'Fagforeningstrekk'},
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
        private modulusService: ModulusService,
        private modalService: UniModalService,
        private salaryTransactionService: SalaryTransactionService,
        private toastService: ToastService,
        private wagetypeService: WageTypeService,
        private supplierService: SupplierService,
        private employeeService: EmployeeService,
        private salarybalanceTemplateService: SalarybalanceTemplateService,
        private employmentService: EmploymentService,
        private statisticsService: StatisticsService,
    ) {
        super(http);
        this.relativeURL = SalaryBalance.RelativeUrl;
        this.entityType = SalaryBalance.EntityType;
    }

    public fill(salaryBalance: SalaryBalance) {
        return super.ActionWithBody(null, salaryBalance, 'fill', RequestMethod.Post);
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
            case 'template':
                helpText = 'Bruk dette feltet om du vil bruke en trekkmal. ' +
                    'Alle innstillinger for trekket gjøres da via malen.';
                break;
            case 'instalmenttype':
                helpText = 'Velg hvilken type trekk du skal legge inn her. ' +
                    'Feltene under vil forandre seg for å tilpasse seg behov for det enkelte trekk. ' +
                    'Er det et trekk som ikke passer inn i forhåndsdefinerte valg, så bruk valget Andre. ' +
                    'Feltet låses for redigering når lagret';
                break;
            case 'name':
                helpText = 'Teksten i dette feltet vises på lønnsavregning, rapporter og lønnsslipp';
                break;
            case 'templatename':
                helpText = 'Teksten her gir navn til malen, for å lettere finne igjen rett mal';
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
                    'For at remittering skal skje må det være krysset for at trekket skal betales automatisk. ';
                break;
            case 'kid':
                helpText = 'For trekk som må ha kidnr ved betaling, legges kidnr inn som en fast opplysning her.';
                break;
            case 'createpayment':
                helpText = 'Lag utbetalingspost til leverandør ved utbetaling av lønnsavregning.';
                break;
            case 'minamount':
                helpText = 'Her legges inn et minimumstrekkbeløp dersom det er valgt prosent-trekk';
                break;
            case 'maxamount':
                helpText = 'Her legges inn et maksimumstrekkbeløp dersom det er valgt prosent-trekk';
                break;
            default:
                break;
        }

        return helpText;
    }

    private updateFormFields(
        salaryBalance: SalaryBalance | SalaryBalanceTemplate,
        changes: SimpleChanges = null,
        form: UniForm
    ): Observable<UniFieldLayout[]> {
        if (!form?.layout) {
            return of([]);
        }
        const fieldFuncs = this.GetFieldFuncs(salaryBalance);

        if (changes) {
            const changesKeys = Object.keys(changes);
            const update = changesKeys.some(change => fieldFuncs.some(func => func.prop === change));
            if (!update) {
                return form.layout.pipe(map(layout => layout.Fields));
            }
        }

        fieldFuncs
            .forEach(fieldfunc => this.editFormField(form, fieldfunc.prop, fieldfunc.func));

        return form.layout.pipe(map(layout => layout.Fields));
    }

    private editFormField(
        form: UniForm,
        prop: string,
        edit: (field: UniFieldLayout) => UniFieldLayout): UniFieldLayout {
        const field = form ? form.field(prop) : null;
        if (field && field.field) {
            return edit(field.field);
        }
        return null;
    }

    private wageTypesObs(): Observable<WageType[]> {
        return this.wagetypeService.getOrderByWageTypeNumber();
    }

    private employeesObs(): Observable<Employee[]> {
        return this.employeeService.GetAll('');
    }

    private suppliersObs(): Observable<Supplier[]> {
        return this.supplierService.GetAll('', ['Info', 'Info.DefaultBankAccount']);
    }

    private templatesObs(): Observable<SalaryBalanceTemplate[]> {
        return this.salarybalanceTemplateService.GetAll('', ['Supplier.Info.DefaultBankAccount.AccountNumber']);
    }

    public getWagetypes() {
        return this.wageTypesObs();
    }

    public getEmployees() {
        return this.employeesObs();
    }

    public getSuppliers() {
        return this.suppliersObs();
    }

    public getInstalmentTypes(filter: string = '') {
        if (filter === 'salarybalancetemplate') {
            return this.instalmentTypes.filter(tp => tp.ID === SalBalType.Other || tp.ID === SalBalType.Union);
        } else {
            return this.instalmentTypes;
        }
    }

    public getTemplates() {
        return this.templatesObs();
    }

    public save(salarybalance: SalaryBalance,
        refreshLines = false,
        lineExpands: string[] = []): Observable<SalaryBalance> {
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
            .switchMap(salBal => this.handlePaymentCreation(salBal).switchMap(res => this.handleModalResponse(salBal, res)))
            .switchMap((salbal: SalaryBalance) => refreshLines && !salbal['_saveAbortet']
                ? this.salaryBalanceLineService
                    .GetAll(`filter=SalaryBalanceID eq ${salbal.ID}`, lineExpands)
                    .map((lines) => {
                        salbal.Transactions = lines;
                        return salbal;
                    })
                : Observable.of(salbal)
            )
            .do(() => this.clearRelatedCaches());
    }

    public deleteSalaryBalance(id: number): Observable<any> {
        return this.Remove(id)
            .do(() => this.clearRelatedCaches())
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
    }

    private clearRelatedCaches(): void {
        this.salaryTransactionService.invalidateCache();
    }

    public handlePaymentCreation(salaryBalance: SalaryBalance): Observable<ConfirmActions> {
        if (salaryBalance.ID || !this.hasBalance(salaryBalance)) {
            return Observable.of(ConfirmActions.REJECT);
        }

        const modal = this.modalService.confirm({
            header: 'Opprett utbetaling',
            message: `Vil du opprette en utbetalingspost av dette forskuddet (beløp: ${salaryBalance.Amount})?`,
            buttonLabels: {
                accept: 'Lag utbetalingspost',
                reject: 'Manuell utbetaling',
                cancel: 'Avbryt'
            }
        });

        return modal.onClose;
    }

    private handleModalResponse(salBal: SalaryBalance, modalResponse: ConfirmActions) {
        if (modalResponse === ConfirmActions.CANCEL) {
            return Observable.of(salBal);
        }

        salBal.CreatePayment = salBal.CreatePayment || modalResponse === ConfirmActions.ACCEPT;

        return salBal.ID
            ? this.Put(salBal.ID, salBal)
            : this.Post(salBal);
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
            .map(response => response.body);
    }

    public updateFields(
        entityObject: SalaryBalance | SalaryBalanceTemplate,
        entity: string,
        updateLayout: boolean = false,
        changes: SimpleChanges = null,
        lastChanges$: BehaviorSubject<SimpleChanges> = new BehaviorSubject({}),
        form: UniForm,
        ignoreFields: string[] = [''],
        basedOnTemplate: boolean = false): Observable<UniFieldLayout[]> {
            const changesObs = changes ? Observable.of(changes) : null;
            const obs = changesObs || lastChanges$.asObservable();

            return obs
            .take(1)
            .map(change => {
                const keys = Object.keys(change);
                return keys;
            })
            .pipe(
                switchMap(changesKey => !updateLayout && form?.layout && !changesKey.some(x => x === 'InstalmentType')
                    ? this.updateFormFields(entityObject, changes, form)
                    : this.refreshLayout(entityObject, ignoreFields, entity, 'SalarybalanceDetails', basedOnTemplate)),
            );
    }

    public updateFromEmployments(emps: number[]) {
        return super.ActionWithBody(null, emps, 'update-from-employments');
    }

    public refreshLayout(
        salbalTemplate: SalaryBalance | SalaryBalanceTemplate,
        ignoreFields: string[],
        entity: string,
        entityStringID: string = 'SalarybalanceDetails',
        basedOnTemplate: boolean = false): Observable<UniFieldLayout[]> {
        return forkJoin([
                this.wageTypesObs(),
                this.employeesObs(),
                this.suppliersObs(),
                this.templatesObs()
            ])
            .switchMap((result: [WageType[], Employee[], Supplier[], SalaryBalanceTemplate[]]) => {
                const [wagetypes, employees, suppliers, templates] = result;
                return this.layout(entityStringID, salbalTemplate, entity, wagetypes, employees, suppliers, templates, basedOnTemplate)
                    .map(layout => {
                        layout.Fields = layout.Fields.filter(field => !ignoreFields.some(name => name === field.Property));
                        return layout;
                    });
            })
            .map(layout => <UniFieldLayout[]>layout.Fields)
            .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
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

    public isHiddenByInstalmentType(salaryBalance: SalaryBalance | SalaryBalanceTemplate): boolean {
        return (salaryBalance.InstalmentType !== SalBalType.Contribution)
            && (salaryBalance.InstalmentType !== SalBalType.Outlay)
            && (salaryBalance.InstalmentType !== SalBalType.Other)
            && (salaryBalance.InstalmentType !== SalBalType.Union)
            && (salaryBalance.InstalmentType !== SalBalType.Garnishment);
    }

    public resetFields(salaryBalance: SalaryBalance | SalaryBalanceTemplate): SalaryBalance | SalaryBalanceTemplate {
        this.resetCreatePayment(salaryBalance);
        return salaryBalance;
    }

    public resetCreatePayment(salaryBalance: SalaryBalance | SalaryBalanceTemplate): SalaryBalance | SalaryBalanceTemplate {
        salaryBalance.CreatePayment = this.isHiddenByInstalmentType(salaryBalance)
            && salaryBalance.InstalmentType !== SalBalType.Garnishment
            && salaryBalance.CreatePayment;

        return salaryBalance;
    }

    public GetFieldFuncs(salaryBalance: SalaryBalance | SalaryBalanceTemplate): IFieldFunc[] {
        return [
            {
                prop: 'Instalment',
                func: instalmentField => instalmentField.ReadOnly = !!salaryBalance.InstalmentPercent
            },
            {
                prop: 'InstalmentPercent',
                func: percentField => percentField.ReadOnly = !!salaryBalance.Instalment
            },
            {
                prop: 'MinAmount',
                func: minamountField =>   minamountField.ReadOnly = !salaryBalance.InstalmentPercent
            },
            {
                prop: 'MaxAmount',
                func: maxamountField => maxamountField.ReadOnly = !salaryBalance.InstalmentPercent
            }
        ];
    }

    public validateCreatePaymentChange(salaryBalance: SalaryBalance | SalaryBalanceTemplate): SalaryBalance | SalaryBalanceTemplate {
        if (salaryBalance.SupplierID) {
            return salaryBalance;
        }
        salaryBalance.CreatePayment = false;
        this.toastService.addToast(
            'Kan ikke lage utbetaling',
            ToastType.bad,
            ToastTime.long,
            'Må ha leverandør for at man skal kunne lage betaling');
        return salaryBalance;
    }

    public getSalarybalancesOnTemplate(templateID: number): Observable<SalaryBalance[]> {
        return super.GetAll(`filter=salaryBalanceTemplateID eq ${templateID}`, ['Employee', 'Employee.BusinessRelationInfo']);
    }

    public layout(
        layoutID: string,
        salBal: SalaryBalance | SalaryBalanceTemplate,
        entity: string,
        wageTypes: WageType[],
        employees: Employee[],
        suppliers: Supplier[],
        templates: SalaryBalanceTemplate[],
        basedOnTemplate: boolean = false
    ): Observable<UniComponentLayout> {
        return of(
            <UniComponentLayout>{
                Name: layoutID,
                BaseEntity: entity,
                Fields: this.GetFieldList(layoutID, salBal, entity, wageTypes, employees, suppliers, templates, basedOnTemplate)
            }
        );
    }

    private GetFieldList(layoutID: string,
        salBal: SalaryBalance | SalaryBalanceTemplate,
        entity: string,
        wageTypes: WageType[],
        employees: Employee[],
        suppliers: Supplier[],
        templates: SalaryBalanceTemplate[],
        basedOnTemplate: boolean = false): UniFieldLayout[] {
            let fields: UniFieldLayout[] = <UniFieldLayout[]>[
                {
                    EntityType: entity,
                    Property: 'SalaryBalanceTemplateID',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Trekkmal',
                    Tooltip: {
                        Text: this.getHelpText('template')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 0,
                    ReadOnly: !!salBal.ID,
                    Options: {
                        source: templates,
                        displayProperty: 'Name',
                        valueProperty: 'ID',
                        debounceTime: 500
                    }
                },
                {
                    EntityType: entity,
                    Property: 'InstalmentType',
                    FieldType: FieldType.DROPDOWN,
                    Label: 'Type',
                    Tooltip: {
                        Text: this.getHelpText('instalmenttype')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 0,
                    ReadOnly: basedOnTemplate || !!salBal.ID,
                    Options: {
                        source: this.getInstalmentTypes(entity),
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
                    EntityType: entity,
                    Property: 'Name',
                    FieldType: FieldType.TEXT,
                    Label: entity === 'salarybalancetemplate' ? 'Navn på mal' : 'Tekst til lønnspost',
                    Tooltip: {
                        Text: this.getHelpText(entity === 'salarybalancetemplate' ? 'templatename' : 'name')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 1,
                    LineBreak: true,
                    ReadOnly: basedOnTemplate || !!salBal.ID ? true : false,
                },
                {
                    EntityType: entity,
                    Property: 'SalarytransactionDescription',
                    FieldType: FieldType.TEXT,
                    Label: 'Tekst til lønnspost',
                    Tooltip: {
                        Text: this.getHelpText('name')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 1,
                    ReadOnly: basedOnTemplate,
                    LineBreak: true,
                },
                {
                    EntityType: entity,
                    Property: 'EmployeeID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Ansatt',
                    FieldSet: 0,
                    Section: 0,
                    Placement: 2,
                    ReadOnly: !!salBal.ID,
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
                    EntityType: entity,
                    Property: 'WageTypeNumber',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Lønnsart',
                    Tooltip: {
                        Text: this.getHelpText('wagetypenumber')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 3,
                    ReadOnly: basedOnTemplate || !!salBal.ID,
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
                    EntityType: entity,
                    Property: 'FromDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Fra dato',
                    Tooltip: {
                        Text: this.getHelpText('fromdate')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 4
                },
                {
                    EntityType: entity,
                    Property: 'ToDate',
                    FieldType: FieldType.LOCAL_DATE_PICKER,
                    Label: 'Til dato',
                    Tooltip: {
                        Text: this.getHelpText('todate')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 5
                },
                {
                    EntityType: entity,
                    Property: 'Amount',
                    FieldType: FieldType.NUMERIC,
                    Label: salBal.InstalmentType === SalBalType.Advance ? 'Beløp' : 'Saldo',
                    Tooltip: {
                        Text: this.getHelpText('amount')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 6,
                    Hidden: !!salBal.ID || (salBal.InstalmentType === SalBalType.Contribution
                        || salBal.InstalmentType === SalBalType.Union),
                    Options: {
                        format: 'money',
                        decimalLength: 2
                    }
                },
                {
                    EntityType: entity,
                    Property: 'Instalment',
                    FieldType: FieldType.NUMERIC,
                    Label: salBal.InstalmentType === SalBalType.Union ? 'Trekk' : 'Avdrag',
                    Tooltip: {
                        Text: this.getHelpText('instalment')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 7,
                    ReadOnly: basedOnTemplate || !!salBal.InstalmentPercent,
                    Options: {
                        format: 'money',
                        decimalLength: 2
                    }
                },
                {
                    EntityType: entity,
                    Property: 'InstalmentPercent',
                    FieldType: FieldType.NUMERIC,
                    Label: salBal.InstalmentType === SalBalType.Union ? 'Trekk prosent' : 'Avdrag prosent',
                    Tooltip: {
                        Text: this.getHelpText('instalmentpercent')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 8,
                    Options: {
                        format: 'money',
                        decimalLength: 2
                    },
                    ReadOnly: basedOnTemplate || !!salBal.Instalment,
                    Hidden: salBal.InstalmentType === SalBalType.Advance
                },
                {
                    EntityType: entity,
                    Property: 'MinAmount',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Minimumsbeløp',
                    Tooltip: {
                        Text: this.getHelpText('minamount')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 8,
                    Options: {
                        format: 'money',
                        decimalLength: 2
                    },
                    ReadOnly: basedOnTemplate || !salBal.InstalmentPercent,
                    Hidden: salBal.InstalmentType !== SalBalType.Union
                },
                {
                    EntityType: entity,
                    Property: 'MaxAmount',
                    FieldType: FieldType.NUMERIC,
                    Label: 'Maksimumsbeløp',
                    Tooltip: {
                        Text: this.getHelpText('maxamount')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 8,
                    Options: {
                        format: 'money',
                        decimalLength: 2
                    },
                    ReadOnly: basedOnTemplate || !salBal.InstalmentPercent,
                    Hidden: salBal.InstalmentType !== SalBalType.Union
                },
                {
                    EntityType: entity,
                    Property: 'SupplierID',
                    FieldType: FieldType.AUTOCOMPLETE,
                    Label: 'Leverandør',
                    Tooltip: {
                        Text: this.getHelpText('supplierid')
                    },
                    FieldSet: 0,
                    Section: 0,
                    Placement: 9,
                    Hidden: this.isHiddenByInstalmentType(salBal),
                    ReadOnly: basedOnTemplate,
                    Options: {
                        source: suppliers,
                        valueProperty: 'ID',
                        template: (supplier: Supplier) => supplier
                            ? `${supplier.SupplierNumber} - ${supplier.Info.Name}`
                            : ''
                    },
                    Validations: [
                        (value: number, field: UniFieldLayout) => {
                            if (!!value || salBal.InstalmentType !== SalBalType.Union) {
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
                    EntityType: entity,
                    Property: 'KID',
                    FieldType: FieldType.TEXT,
                    Label: 'Kid',
                    Tooltip: {
                        Text: this.getHelpText('kid')
                    },
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
                    Hidden: this.isHiddenByInstalmentType(salBal),
                    ReadOnly: basedOnTemplate,
                },
                {
                    EntityType: entity,
                    Property: 'Supplier.Info.DefaultBankAccount.AccountNumber',
                    FieldType: FieldType.TEXT,
                    ReadOnly: true,
                    Label: 'Kontonummer',
                    FieldSet: 0,
                    Section: 0,
                    Placement: 11,
                    Options: {},
                    Hidden: this.isHiddenByInstalmentType(salBal)
                },
                {
                    EntityType: entity,
                    Property: 'CreatePayment',
                    FieldType: FieldType.CHECKBOX,
                    ReadOnly: basedOnTemplate,
                    Tooltip: {
                        Text: this.getHelpText('createpayment')
                    },
                    Label: 'Lag utbetaling',
                    FieldSet: 0,
                    Section: 0,
                    Placement: 12,
                    Options: {},
                    Hidden: this.isHiddenByInstalmentType(salBal) || salBal.InstalmentType === SalBalType.Garnishment,
                }
            ];

        if (this.isSalaryBalance(salBal)) {
            const index = fields.findIndex(f => f.Property === 'MaxAmount');
            const salaryBalance: SalaryBalance = <SalaryBalance>salBal;
            const field: any = {
                EntityType: entity,
                Property: 'EmploymentID',
                FieldType: FieldType.AUTOCOMPLETE,
                Label: 'Arbeidsforhold',
                FieldSet: 0,
                Section: 0,
                Placement: 2,
                ReadOnly: !salBal['EmployeeID'],
                Options: {
                    valueProperty: 'ID',
                    template: (employment: Employment) => employment
                        ? `${employment.ID} - ${employment.JobName}`
                        : '',
                    getDefaultData: () => {
                        if ((!salaryBalance.EmploymentID && salaryBalance.ID > 0) || !salaryBalance.EmployeeID) {
                            return of([]);
                        }
                        return salaryBalance.EmploymentID
                            ? this.employmentService.GetAll(`filter=ID eq ${salaryBalance.EmploymentID}`)
                            : this.employmentService.GetAll(`filter=EmployeeID eq ${salaryBalance.EmployeeID} and Standard eq true`);
                    },
                    search: (query: string) => this.employmentService.searchEmployments(query, salBal['EmployeeID'])
                }
            };
            fields = [...fields.slice(0, index + 1),
                field,
                ...fields.slice(index + 1, fields.length),
            ];
        }
        return fields;
    }

    private isSalaryBalance(salBal: SalaryBalance | SalaryBalanceTemplate) {
        return 'EmployeeID' in salBal;
    }

    getOpenTransIDsOnSalaryBalances() {
        const filter = `isnull(PayrollRun.StatusCode, 0) eq 0`;
        return this.getTransIDsOnSalaryBalances(filter, 'SalaryTransaction.PayrollRun');
    }

    private getTransIDsOnSalaryBalances(filter?: string, expand?: string): Observable<number[]> {
        const query = `model=SalaryBalanceLine`
        + `&select=SalaryTransactionID as SalaryTransactionID`
        + `&filter=isnull(SalaryTransactionID,0) ne 0${filter && ` and (${filter})`}`
        + `&expand=SalaryTransaction${expand && (',' + expand)}`;
        return this.statisticsService
            .GetAllUnwrapped(query)
            .pipe(
                map(result => result.map(line => line['SalaryTransactionID']))
            );
    }
}
