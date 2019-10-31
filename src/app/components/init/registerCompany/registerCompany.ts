import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import {CompanySettings, Contract} from '@uni-entities';
import {SignalRService} from '@app/services/common/signal-r.service';
import {environment} from 'src/environments/environment';
import {Router, ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';

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
    contractID: number;
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

        this.authService.token$.pipe(take(1)).subscribe(() => {
            this.uniHttp
                .asGET()
                .usingInitDomain()
                .withEndPoint('contracts')
                .send()
                .map(res => res.body)
                .subscribe(
                    contracts => {
                        if (contracts && contracts[0]) {
                            this.contractID = contracts[0].ID;
                        } else {
                            this.missingContract = true;
                        }
                    },
                    err => console.error(err)
            );
        });
    }

    onCompanyTypeSelected(type: string) {
        this.router.navigateByUrl('/init/register-company?type=' + type);
    }

    logout() {
        this.authService.userManager.signoutRedirect();
    }
}
