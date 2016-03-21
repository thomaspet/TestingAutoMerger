import {
    WageType,
    RateTypeColumn,
    TaxType,
    LimitType,
    StdWageType,
    WageTypeSupplement,
} from '../unientities'

declare var _;

export class WageTypeModel implements WageType {
    WageTypeId: number = null;
	SystemRequiredWageType: number = 0;
	Base_EmploymentTax: boolean = false;
	Base_Vacation: boolean = false;
	Base_Payment: boolean = false;
	WageTypeName: string = "";
	RatetypeColumn: RateTypeColumn = RateTypeColumn.none;
	taxtype: TaxType = TaxType.Tax_None;
	HideFromPaycheck: boolean = false;
	NoNumberOfHours: boolean = false;
	Aga_otp: boolean = false;
	Aga_nav: boolean = false;
	Limit_type: LimitType = LimitType.None;
	Limit_value: number = 0;
	Limit_WageTypeID: number = 0;
	Limit_newRate: number = 0;
	StandardWageTypeFor: StdWageType = StdWageType.None;
	Base_div1: boolean = false;
	Base_div2: boolean = false;
	Base_div3: boolean = false;
	Rate: number = null;
	RateFactor: number = 1;
	AccountNumber: number = null;
	AccountNumber_balance: number = null;
	IncomeType: string = "";
	Benefit: string = "";
	Description: string = "";
	Postnr: string = "";
	StatusID: number = null;
	ID: number = 0;
	Deleted: boolean = false;
	CustomFields: any = {};
    SupplementaryInformations: Array<WageTypeSupplement> = null;
    CustomValues: any = {};
    
    static createFromObject(data: any){
        let instance = new WageTypeModel();
        instance = _.merge(instance, data);
        return instance;
    }
    
    constructor() {
        
    }
}