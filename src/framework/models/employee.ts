import {
    IEmployee,
    PaymentInterval,
    InternationalIDType,
    ForeignWorker,
    IBusinessRelation,
    IEmployment,
    IBankAccountSalary,
    IEmployeeCategoryLink,
    IVacationRateEmployee,
    ILocalization
} from "../interfaces/interfaces";

declare var _;

export class EmployeeModel implements IEmployee {
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
    BusinessRelationInfo: IBusinessRelation = null;
    Employments: Array<IEmployment> = [];
    BankAccounts: Array<IBankAccountSalary> = [];
    EmployeeCategoryLinks: Array<IEmployeeCategoryLink> = [];
    VacationRateEmployee: IVacationRateEmployee = null;
    Localization: ILocalization = null;
    CustomFields: any = {};

    static createFromObject(data: any) {
        let instance = new EmployeeModel();
        instance = _.merge(instance, data);
        return instance;
    }

    constructor() {

    }
}