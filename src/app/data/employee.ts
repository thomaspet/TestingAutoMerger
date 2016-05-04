import {Injectable, Inject} from "angular2/core";
import { Observable } from "rxjs/Observable";
import {UniHttp} from "../../framework/core/http/http";
import {FieldType} from "../unientities";

@Injectable()
export class EmployeeDS {

    expandedProperties = [
        "BusinessRelationInfo.Addresses",
        "BusinessRelationInfo.Emails",
        "BusinessRelationInfo.Phones",
        "Employments.SubEntity.BusinessRelationInfo",
        "BankAccounts",
        "VacationRateEmployee",
        "SubEntity"
    ].join(",");
        
    subEntities: Observable<any>;

    constructor(@Inject(UniHttp)
                public http: UniHttp) {
    }

    get(id: number|string) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("employees/" + id)
            .send({expand: this.expandedProperties});
    }

    getSubEntities() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("subentities")
            .send({expand: "BusinessRelationInfo"});
    }
    
    getTotals(ansattID:number) {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("salarytrans")
            .send({filter: "EmployeeNumber eq " + ansattID});
    }

    getEmployeeLeave() {
        return this.http
            .asGET()
            .usingBusinessDomain()
            .withEndPoint("EmployeeLeave")
            .send();
    }
}
