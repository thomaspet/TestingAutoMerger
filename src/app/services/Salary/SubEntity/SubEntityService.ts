import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {SubEntity, BusinessRelation, FieldType} from '../../../unientities';
import {Observable} from "rxjs/Observable";

let layout = {
    Name: "MockSubEntityLayout",
    BaseEntity: "SubEntity",
    Fields: [
        {
            ComponentLayoutID: 1,
            EntityType: "BusinessRelation",
            Property: "BusinessRelationInfo.Name",
            Placement: 1,
            Hidden: false,
            FieldType: FieldType.TEXT,
            ReadOnly: true,
            LookupField: false,
            Label: "Virksomhet navn",
            Description: null,
            HelpText: null,
            FieldSet: 0,
            Section: 1,
            Legend: "",
            hasLineBreak: false,
            Validations: [
                {
                    ErrorMessage: "Required field",
                    Level: 3,
                    Operator: "REQUIRED"
                }
            ]
        },
        {
            ComponentLayoutID: 1,
            EntityType: "SubEntity",
            Property: "OrgNumber",
            Placement: 1,
            Hidden: false,
            FieldType: FieldType.TEXT,
            ReadOnly: true,
            LookupField: false,
            Label: "Orgnr for virksomheten",
            Description: null,
            HelpText: null,
            FieldSet: 0,
            Section: 1,
            Legend: "",
            hasLineBreak: false,
            Validations: [
                {
                    ErrorMessage: "Required field",
                    Level: 3,
                    Operator: "REQUIRED"
                }
            ]
        },
        {
            ComponentLayoutID: 1,
            EntityType: "SubEntity",
            Property: "MunicipalityNo",
            Placement: 2,
            Hidden: false,
            FieldType: FieldType.TEXT,
            ReadOnly: true,
            LookupField: false,
            Label: "Kommunenr",
            Description: null,
            HelpText: null,
            FieldSet: 0,
            Section: 1,
            Legend: "",
            hasLineBreak: false,
            Validations: [
                {
                    ErrorMessage: "Required field",
                    Level: 3,
                    Operator: "REQUIRED"
                }
            ]
        },
        {
            ComponentLayoutID: 1,
            EntityType: "SubEntity",
            Property: "AgaZone",
            Placement: 2,
            Hidden: false,
            FieldType: FieldType.TEXT,
            ReadOnly: true,
            LookupField: false,
            Label: "Sone",
            Description: null,
            HelpText: null,
            FieldSet: 0,
            Section: 1,
            Legend: "",
            hasLineBreak: false,
            Validations: [
                {
                    ErrorMessage: "Required field",
                    Level: 3,
                    Operator: "REQUIRED"
                }
            ]
        },
    ]
}

export class SubEntityService extends BizHttp<SubEntity> {
    constructor(http : UniHttp){
        super(http);
        this.relativeURL = SubEntity.relativeUrl;
    }
    
    public getLayout(ID: string) {
        return Observable.of(layout);
    }
    
    public getLayoutAndEntity(LayoutID: string, EntityID: number) {
        var layout, self = this;
        return this.GetLayout(LayoutID)
            .concatMap((data: any) => {
                layout = data;
                return self.Get(EntityID, data.Expands);
            })
            .map((entity: any) => {
                return [layout, entity];
            });
    }
}