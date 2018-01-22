import { CompanySettings } from "@uni-entities";

export class ActivateAP {
    public orgnumber: string;
    public orgname: string;
    public orgphone: string;
    public orgemail: string;
    public contactname: string;
    public contactphone: string;
    public contactemail: string;
    public incommingInvoice: boolean;
    public outgoingInvoice: boolean;
    public settings: CompanySettings;
}
