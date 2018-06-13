import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {SubEntity} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {CONTROLS_ENUM} from '../../../framework/ui/uniform/index';
import {Observable} from 'rxjs';

@Injectable()
export class SubEntityService extends BizHttp<SubEntity> {

    constructor(protected http: UniHttp) {
        super(http);

        this.relativeURL = SubEntity.RelativeUrl;
        this.entityType = SubEntity.EntityType;
        this.DefaultOrderBy = null;
    }

    public getMainOrganization() {
        return this.GetAll('SuperiorOrganization eq 0 or SuperiorOrganization eq null', ['BusinessRelationInfo']);
    }

    public getFromEnhetsRegister(orgno: string) {
        return super.GetAction(null, 'sub-entities-from-brreg', 'orgno=' + orgno);
    }

    public getLayout(layoutID: string) {
        return Observable.from([{
            Name: layoutID,
            Fields: [
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.Name',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Virksomhetsnavn',
                    FieldSet: 1,
                    Legend: 'Kontaktinfo',
                },
                {
                    Property: 'OrgNumber',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Orgnr for virksomhet',
                    FieldSet: 1,
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.AddressLine1',
                    FieldType: CONTROLS_ENUM.TEXT,
                    Label: 'Gateadresse',
                    FieldSet: 1,
                },
                {
                    EntityType: 'BusinessRelation',
                    Property: 'BusinessRelationInfo.InvoiceAddress.PostalCode',
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    Label: 'Postnummer',
                    FieldSet: 1,
                },
                {
                    Property: 'MunicipalityNo',
                    FieldType: CONTROLS_ENUM.AUTOCOMPLETE,
                    Label: 'Kommunenummer',
                    FieldSet: 1,
                },
                {
                    Property: 'AgaZone',
                    FieldType: CONTROLS_ENUM.SELECT,
                    Label: 'Sone',
                    FieldSet: 2,
                    Legend: 'AGA',
                },
                {
                    Property: 'AgaRule',
                    FieldType: CONTROLS_ENUM.SELECT,
                    Label: 'Beregningsregel aga',
                    FieldSet: 2,
                },
                {
                    Property: 'freeAmount',
                    FieldType: CONTROLS_ENUM.NUMERIC,
                    Label: 'Fribeløp',
                    FieldSet: 2,
                }
            ]
        }]);
    }
}
