import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ElsaUserLicense, ElsaCompanyLicense} from '@app/models';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import * as moment from 'moment';

@Component({
    selector: 'license-user-details',
    templateUrl: './license-user-details.html',
    styleUrls: ['./license-user-details.sass']
})
export class UserDetails {
    @Input() user: ElsaUserLicense;
    @Output() close = new EventEmitter();

    columns = [{ header: 'Selskap', field: 'CompanyName' }];
    companies: ElsaCompanyLicense[];

    constructor(
        private authService: AuthService,
        private http: UniHttp
    ) {}

    ngOnChanges() {
        if (this.user) {
            const contractID = this.authService.currentUser.License.Company.ContractID;
            const endpoint = `/api/userlicenses/${this.user.UserIdentity}/contracts/${contractID}/companylicenses`;
            this.http.asGET()
                .usingElsaDomain()
                .withEndPoint(endpoint)
                .send()
                .subscribe(
                    res => {
                        const companies = (res && res.body) || [];
                        this.companies = companies
                            .filter(company => {
                                return !moment(company.EndDate).isValid()
                                    ||  moment(company.EndDate).isAfter(moment(new Date()));
                            });
                    },
                    err => console.error(err)
                );
        }
    }
}
