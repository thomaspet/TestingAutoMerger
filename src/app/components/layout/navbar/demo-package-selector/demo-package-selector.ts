import {Component, Input} from '@angular/core';
import {AuthService} from '@app/authService';
import {ElsaContractService} from '@app/services/services';
import {ElsaContractType} from '@app/models';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Component({
    selector: 'demo-package-selector',
    templateUrl: './demo-package-selector.html',
    styleUrls: ['./demo-package-selector.sass']
})
export class DemoPackageSelector {
    @Input() isSupportUser: boolean;
    expanded: boolean;

    currentType: ElsaContractType;
    contractTypes: ElsaContractType[];

    constructor(
        private router: Router,
        private authService: AuthService,
        private permissionService: FeaturePermissionService,
        private contractService: ElsaContractService,
    ) {}

    ngOnInit() {
        this.contractService.getCustomContractTypes().subscribe(
            types => {
                this.contractTypes = types;
                this.currentType = types.find(type => type.Name === this.permissionService.packageName);
            },
            err => console.error(err)
        );
    }

    onContractTypeSelected(contractType: ElsaContractType) {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/reload', { skipLocationChange: true }).then(() => {
            this.authService.authentication$.pipe(
                take(1)
            ).subscribe(authDetails => {
                this.currentType = contractType;
                this.permissionService.demoTestPackage(contractType.Name);

                // Trigger sidebar link filtering
                this.authService.authentication$.next(authDetails);

                this.router.navigateByUrl(currentUrl, { skipLocationChange: true });
            });
        });
    }
}
