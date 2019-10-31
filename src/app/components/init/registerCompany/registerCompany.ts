import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import {CompanySettings, Contract} from '@uni-entities';
import {SignalRService} from '@app/services/common/signal-r.service';
import {environment} from 'src/environments/environment';
import {Router, ActivatedRoute} from '@angular/router';

export interface CompanyInfo {
    companySettings: CompanySettings;
    isTemplate: boolean;
    valid: boolean;
}

@Component({
    selector: 'uni-register-company',
    templateUrl: './registerCompany.html',
    styleUrls: ['./registerCompany.sass'],
})
export class RegisterCompany {
    appName = environment.isSrEnvironment ? 'SpareBank1 SR-bank Regnskap' : 'Uni Economy';

    selectedCompanyType: string;

    missingContract = false;
    contractID: number = 1234;
    contracts: Contract[];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private uniHttp: UniHttp,
        private authService: AuthService,
        private signalRservice: SignalRService
    ) {
        this.route.queryParamMap.subscribe(params => {
            this.selectedCompanyType = params.get('type') || undefined;
        });

        this.uniHttp
            .asGET()
            .usingInitDomain()
            .withEndPoint('contracts')
            .send()
            .map(res => res.body)
            .subscribe(
                (res: Contract[]) => {
                    if (!res) {
                        this.missingContract = true;
                    }

                    if (res.length > 1) {
                        this.contracts = res;
                    } else {
                        this.contractID = res[0].ID;
                    }
                },
                err => console.error(err)
        );
    }

    onCompanyTypeSelected(type: string) {
        this.router.navigateByUrl('/init/register-company?type=' + type);
    }

    logout() {
        this.authService.userManager.signoutRedirect();
    }
}
