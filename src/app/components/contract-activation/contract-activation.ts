import {Component, HostBinding} from '@angular/core';
import {FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';

import {CompanySettings, User} from '@uni-entities';
import {AuthService} from '@app/authService';
import {
    ModulusService,
    CompanySettingsService,
    UserService,
    ErrorService,
    BusinessRelationService,
} from '@app/services/services';

import {UniModalService} from '@uni-framework/uni-modal/modalService';
import {AfterActivationModal} from './after-activation-modal/after-activation-modal';

@Component({
    selector: 'contract-activation',
    templateUrl: './contract-activation.html',
    styleUrls: ['./contract-activation.sass'],
    host: {'class': 'uni-redesign'}
})
export class ContractActivation {
    @HostBinding('class.overlay') trialExpired: boolean;

    licenseData: FormGroup;
    noBrRegMatch: boolean;

    busy: boolean;
    isTrialUser: boolean;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private modulusService: ModulusService,
        private router: Router,
        private brService: BusinessRelationService,
        private errorService: ErrorService,
        companySettingsService: CompanySettingsService,
        userService: UserService
    ) {
        this.licenseData = new FormGroup({
            orgNumber: new FormControl('', this.orgNumberValidator.bind(this)),
            companyName: new FormControl('', Validators.required),
            address: new FormControl('', Validators.required),
            postalCode: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            isBureau: new FormControl(false),
            name: new FormControl('', Validators.required),
            phone: new FormControl('', Validators.required),
            email: new FormControl('', Validators.email),
            hasAcceptedTerms: new FormControl(false, Validators.requiredTrue)
        });

        forkJoin(
            companySettingsService.Get(1),
            userService.getCurrentUser()
        ).subscribe(
            res => this.mapDataToFormModel(res[0], res[1]),
            err => errorService.handle(err)
        );

        // TODO, proper checks
        this.trialExpired = true;
        this.isTrialUser = true;

        // this.authService.authentication$.subscribe(auth => {
        //     this.trialExpired = auth && !auth.hasActiveContract;

        //     // Try/catch to avoid having to null guard. We don't care about errors here
        //     try {
        //         this.isTrialUser = true;
        //         // this.isTrialUser = auth.user.License.ContractType.TypeName === 'Demo';
        //     } catch (e) {}

        //     console.log(this.trialExpired, this.isTrialUser);
        // });
    }

    activate() {
        this.busy = true;

        // TODO: need endpoint for contract-activation
        setTimeout(() => {
            this.busy = false;
            this.modalService.open(AfterActivationModal);
            this.router.navigateByUrl('/');
        }, 1000);
    }

    brRegLookup() {
        const orgNumberControl = this.licenseData.controls['orgNumber'];
        if (orgNumberControl.value && orgNumberControl.valid) {
            const orgNumberTrimmed = orgNumberControl.value.replace(/\ /g, '');
            orgNumberControl.setValue(orgNumberTrimmed, {emitEvent: false});

            this.brService.search(orgNumberTrimmed).subscribe(
                res => {
                    const brRegInfo = res[0];

                    if (brRegInfo) {
                        this.noBrRegMatch = false;
                        const isBureau = brRegInfo.nkode1 === '69.201'
                            || brRegInfo.nkode2 === '69.201'
                            || brRegInfo.nkode3 === '69.201';

                        this.licenseData.patchValue({
                            companyName: brRegInfo.navn,
                            address: brRegInfo.forretningsadr,
                            postalCode: brRegInfo.forradrpostnr,
                            city: brRegInfo.forradrpoststed,
                            isBureau: isBureau
                        });
                    } else {
                        this.noBrRegMatch = true;
                    }
                },
                err => console.error(err) // fail silently
            );
        }
    }

    private mapDataToFormModel(settings: CompanySettings, user: User) {
        const companyAddress: any = settings.DefaultAddress || {};

        this.licenseData.patchValue({
            orgNumber: settings.OrganizationNumber,
            companyName: settings.CompanyName,
            address: companyAddress.AddressLine1,
            postalCode: companyAddress.PostalCode,
            city: companyAddress.City,
            name: user.DisplayName,
            phone: user.PhoneNumber,
            email: user.Email,
        });

        // Run br-reg lookup on init
        if (settings.OrganizationNumber) {
            this.brRegLookup();
        }

        // Run br-reg lookup when the user changes orgnumber (to a valid one)
        this.licenseData.get('orgNumber').valueChanges
            .distinctUntilChanged()
            .subscribe(() => {
                if (this.licenseData.get('orgNumber').valid) {
                    this.brRegLookup();
                }
            });
    }

    private orgNumberValidator(control: AbstractControl) {
        const orgNumber = (control.value || '').replace(/\ /g, '');
        if (!orgNumber || !this.modulusService.isValidOrgNr(orgNumber)) {
            return { 'orgNumber': true };
        }

        return null;
    }
}
