import {Injectable} from '@angular/core';
import {UniHttp} from '../../../framework/core/http/http';
import {Observable} from 'rxjs';
import {ElsaUserLicense_deprecated} from '@app/models';

@Injectable()
export class ElsaCompanyLicenseService {
    constructor(private uniHttp: UniHttp) {}

    public GetAllUsers(companyLicenseId: string): Observable<ElsaUserLicense_deprecated[]> {
        return this.uniHttp
            .asGET()
            .usingElsaDomain()
            .withEndPoint(`/api/CompanyLicenses/${companyLicenseId}/Userlicenses`)
            .send()
            .map(req => req.json());
    }
}
