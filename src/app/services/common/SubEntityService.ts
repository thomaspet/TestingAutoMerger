import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {CONTROLS_ENUM} from '../../../framework/uniform/controls/index';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SubEntityService extends BizHttp<SubEntity> {
    
    constructor(http: UniHttp) {        
        super(http);
        
        this.relativeURL = SubEntity.RelativeUrl;
        this.entityType = SubEntity.EntityType;
        this.DefaultOrderBy = null;
    }
    
    public getMainOrganization() {
        return this.GetAll('SuperiorOrganization eq 0 or SuperiorOrganization eq null', ['BusinessRelationInfo']);
    }

    public delete(ID: number) {
        return this.http
            .asDELETE()
            .usingBusinessDomain()
            .withEndPoint('subentities/' + ID)
            .send();
    }

    public getFromEnhetsRegister(orgno: string) {
        return this.http
                   .asGET()
                   .usingBusinessDomain()
                   .withEndPoint('subentities?action=sub-entities-from-brreg&orgno=' + orgno)
                   .send()
                   .map(response => response.json());
    }

    public getLayout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            Fields: [
                {
                    ComponentLayoutID: 1,
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Virksomhetsnavn',
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
                    Property: 'OrgNumber',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Orgnr for virksomhet',
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
                    Property: 'AgaZone',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.SELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Sone',
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
                    Property: 'AgaRule',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.SELECT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Beregningsregel aga',
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
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.AddressLine1',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.TEXT,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Gateadresse',
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
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.PostalCode',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Postnr',
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
                    Property: 'MunicipalityNo',
                    Placement: 1,
                    Hidden: false,
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    ReadOnly: false,
                    LookupField: false,
                    Label: 'Kommunenr',
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
        }]);
    }       
}
