import {Component} from '@angular/core';
import {UniHttp} from '@uni-framework/core/http/http';
import {AuthService} from '@app/authService';
import {CompanySettings, Contract} from '@uni-entities';
import {SignalRService} from '@app/services/common/signal-r.service';
import {environment} from 'src/environments/environment';
import {Router, ActivatedRoute} from '@angular/router';
import {take} from 'rxjs/operators';
import {InitService} from '../init.service';

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
    appName = environment.isSrEnvironment ? 'SpareBank1 SR-Bank Regnskap' : 'Uni Economy';

    selectedCompanyType: string;
    busy: boolean;
    missingContract = false;
    contractID: number;
    contracts: Contract[];

    constructor(
        private initService: InitService,
        private router: Router,
        private route: ActivatedRoute,
        private uniHttp: UniHttp,
        private authService: AuthService,
        private signalRservice: SignalRService
    ) {
        this.route.queryParamMap.subscribe(params => {
            this.selectedCompanyType = params.get('type') || undefined;
        });

        this.authService.isAuthenticated().then(isAuthenticated => {
            if (isAuthenticated) {
                this.initService.getContracts().subscribe(contracts => {
                    if (contracts && contracts[0]) {
                        this.contractID = contracts[0].ID;
                    } else {
                        this.missingContract = true;
                    }
                });
            } else {
                this.router.navigateByUrl('/init/login');
            }
        });
    }

    onCompanyTypeSelected(type: string) {
        this.router.navigateByUrl('/init/register-company?type=' + type);
    }

    logout() {
        this.authService.userManager.signoutRedirect();
    }
}
