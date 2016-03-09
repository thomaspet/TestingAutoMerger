import {
    Employee,
    PaymentInterval,
    InternationalIDType,
    ForeignWorker,
    BusinessRelation,
    Employment,
    BankAccountSalary,
    EmployeeCategoryLink,
    VacationRateEmployee,
    Localization
} from "../unientities";

declare var _;

export class EmployeeModel implements Employee {
    BusinessRelationID: number = 0;
    PaymentInterval: PaymentInterval = 0;
    EmployeeNumber: number = 0;
    SocialSecurityNumber: string = "";
    BirthDate: Date = null;
    TaxTable: string = "";
    isPensioner: boolean = false;
    TaxPercentage: number = 0;
    NonTaxableAmount: number = 0;
    MunicipalityNo: string = "";
    AdvancePaymentAmount: number = 0;
    InternationalID: string = "";
    InternasjonalIDType: InternationalIDType = 0;
    InternasjonalIDCountry: string = "";
    ForeignWorker: ForeignWorker = 0;
    VacationRateEmployeeID: number = 0;
    LocalizationID: number = 0;
    Active: boolean = false;
    PhotoID: number = 0;
    EmploymentDate: Date = null;
    Sex: number = 0;
    StatusID: number = 0;
    ID: number = 0;
    Deleted: boolean = false;
    BusinessRelationInfo: BusinessRelation = null;
    Employments: Array<Employment> = [];
    BankAccounts: Array<BankAccountSalary> = [];
    EmployeeCategoryLinks: Array<EmployeeCategoryLink> = [];
    VacationRateEmployee: VacationRateEmployee = null;
    Localization: Localization = null;
    CustomFields: any = {};

    static createFromObject(data: any) {
        let instance = new EmployeeModel();
        instance = _.merge(instance, data);
        return instance;
    }

    constructor() {

    }
}