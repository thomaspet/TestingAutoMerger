import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {Company} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';

@Injectable()
export class CompanyService extends BizHttp<Company> {
    constructor(http: UniHttp, authService: AuthService) {
        super(http, authService);
        this.relativeURL = Company.RelativeUrl;
        this.entityType = Company.EntityType;
        this.DefaultOrderBy = null;
    }

    public AssignToWebHookSubscriber(id: number, webHookSubscriberId: string): Observable<any> {
        return this.PutAction(
            id,
            'attach-to-webhook-subscriber',
            'webHookSubscriberId=' + webHookSubscriberId
        );
    }
}
