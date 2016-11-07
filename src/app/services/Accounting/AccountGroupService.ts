import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {AccountGroup} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';

@Injectable()
export class AccountGroupService extends BizHttp<AccountGroup> {

    constructor(http: UniHttp) {
        super(http);

        //TODO: should resolve this from configuration based on type (IAccount)? Frank is working on something..
        this.relativeURL = AccountGroup.RelativeUrl;

        this.entityType = AccountGroup.EntityType;

        //set this property if you want a default sort order from the API, e.g. AccountNumber
        this.DefaultOrderBy = 'Name';
    }


    // should consider getting this from the server, needs an "aliasname"/shortname for the groups if so
    public getTopLevelGroupName(groupNumber: number): string {
        let newName: string = '';

        switch (groupNumber) {
            case 1:
                newName = 'Eiendeler';
                break;
            case 2:
                newName = 'Egenkapital/gjeld';
                break;
            case 3:
                newName = 'Salgs-/driftsinntekter';
                break;
            case 4:
                newName = 'Varekostnader';
                break;
            case 5:
                newName = 'Lønnskostnader';
                break;
            case 6:
                newName = 'Andre driftskostnader';
                break;
            case 7:
                newName = 'Andre driftskostnader';
                break;
            case 8:
                newName = 'Finansinntekter/kostnader';
                break;
            default:
                newName = '';
        }

        return newName;
    }
}
