import {Component, HostBinding} from '@angular/core';
import {FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import {Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {take} from 'rxjs/operators';

import {CompanySettings, Agency, Company} from '@uni-entities';
import {AuthService} from '@app/authService';
import {CompanyActionsModal, UniModalService} from '@uni-framework/uni-modal';
import {ElsaCustomer} from '@app/models';
import {environment} from 'src/environments/environment';
import {
    ModulusService,
    CompanySettingsService,
    ErrorService,
    BusinessRelationService,
    ElsaContractService,
    CompanyService,
    ElsaCustomersService,
} from '@app/services/services';

@Component({
    selector: 'contract-activation',
    templateUrl: './contract-activation.html',
    styleUrls: ['./contract-activation.sass'],
})
export class ContractActivation {
    @HostBinding('class.overlay') trialExpired: boolean;

    isSrEnvironment = environment.isSrEnvironment;
    isSrCustomer: boolean;

    licenseData: FormGroup;
    noBrRegMatch: boolean;

    busy: boolean;
    isDemoLicense: boolean;
    canActivateContract: boolean;

    wrongCompanyMessage: string;
    mainCompany: Company;

    companySettings: CompanySettings;
    customer: ElsaCustomer;

    constructor(
        private authService: AuthService,
        private modalService: UniModalService,
        private modulusService: ModulusService,
        private router: Router,
        private brService: BusinessRelationService,
        private errorService: ErrorService,
        private companyService: CompanyService,
        private companySettingsService: CompanySettingsService,
        private elsaCustomerService: ElsaCustomersService,
        private elsaContractService: ElsaContractService,
    ) {
        this.authService.authentication$.pipe(take(1)).subscribe(auth => {
            this.trialExpired = auth && !auth.hasActiveContract;

            try {
                const license = auth.user.License;
                this.canActivateContract = license.CustomerAgreement.CanAgreeToLicense;
                this.isDemoLicense = license.ContractType.TypeName === 'Demo';

                if (this.canActivateContract && this.isDemoLicense) {
                    this.initActivationData(license.Company.ContractID);
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    canDeactivate(routeToActivate: string) {
        if (this.trialExpired) {
            // Allow company change and logout to pass canDeactivate check
            return routeToActivate.includes('reload') || routeToActivate.includes('init');
        } else {
            return true;
        }
    }

    private initActivationData(contractID: number) {
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
            this.companySettingsService.Get(1),
            this.elsaCustomerService.getByContractID(contractID)
        ).subscribe(
            res => this.mapDataToFormModel(res[0], res[1]),
            err => this.errorService.handle(err)
        );
    }

    goToMainCompany() {
        this.authService.setActiveCompany(this.mainCompany);
    }

    activate() {
        this.busy = true;

        const formData = this.licenseData.value;
        const settings = this.companySettings;
        const customer = this.customer;

        settings.OrganizationNumber = formData.orgNumber;
        settings.CompanyName = formData.companyName;

        if (!settings.DefaultAddress) {
            settings.DefaultAddress = <any> {
                _createguid: this.companySettingsService.getNewGuid()
            };
        }

        settings.DefaultAddress.AddressLine1 = formData.address;
        settings.DefaultAddress.PostalCode = formData.postalCode;
        settings.DefaultAddress.City = formData.city;

        customer.ContactPerson = formData.name;
        customer.ContactPhone = formData.phone;
        customer.ContactEmail = formData.email;

        forkJoin(
            this.companySettingsService.Put(1, settings),
            this.elsaCustomerService.put(customer)
        ).subscribe(
            () => {
                const contractID = this.authService.currentUser.License.Company.ContractID;
                if (contractID) {
                    this.elsaContractService.activateContract(
                        contractID, formData.isBureau
                    ).subscribe(
                        () => {
                            this.authService.loadCurrentSession().subscribe(() => {
                                this.trialExpired = false;
                                this.modalService.open(CompanyActionsModal, { header: 'Kundeforhold aktivert' });
                                this.router.navigateByUrl('/');
                            });

                            if (this.isSrEnvironment && !this.isSrCustomer) {
                                let url = 'https://www.sparebank1.no/nb/sr-bank/bedrift/kundeservice/kjop/bli-kunde.html';
                                if (settings.OrganizationNumber) {
                                    url += `?bm-orgNumber=${settings.OrganizationNumber}`;
                                }
                                window.open(url, '_blank');
                            }
                        },
                        err => this.errorService.handle(err)
                    );
                }
            },
            err => this.errorService.handle(err)
        );
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

    private mapDataToFormModel(settings: CompanySettings, customer: ElsaCustomer) {
        this.companySettings = settings;
        this.customer = customer;
        const companyAddress: any = settings.DefaultAddress || {};

        this.licenseData.patchValue({
            orgNumber: settings.OrganizationNumber,
            companyName: settings.CompanyName,
            address: companyAddress.AddressLine1,
            postalCode: companyAddress.PostalCode,
            city: companyAddress.City,
            name: customer.ContactPerson,
            phone: customer.ContactPhone,
            email: customer.ContactEmail,
        });

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
