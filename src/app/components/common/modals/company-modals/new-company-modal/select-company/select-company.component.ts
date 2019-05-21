import {Component, Output, EventEmitter, Input} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CompanySettings, Address, Company} from '@uni-entities';
import {
    ModulusService,
    ErrorService,
    BusinessRelationService,
    CompanyService,
} from '@app/services/services';

export interface CompanyInfo {
    companySettings: CompanySettings;
    isTemplate: boolean;
    valid: boolean;
}

@Component({
    selector: 'uni-select-company',
    templateUrl: './select-company.component.html',
    styleUrls: ['./select-company.component.sass']
})
export class SelectCompanyComponent {
    @Input() companyInfo: CompanyInfo;
    @Output() companyInfoChange = new EventEmitter<CompanyInfo>();

    formGroup: FormGroup;
    orgNumberAlreadyExists = false;
    isOrgNumberValid = true;
    isCompanyNameFieldTouched: boolean;

    private companies: Company[] = [];

    constructor(
        private businessRelationService: BusinessRelationService,
        private companyService: CompanyService,
        private modulusService: ModulusService,
        private errorService: ErrorService,
    ) {}

    ngOnInit() {
        this.formGroup = new FormGroup({
            companyName: new FormControl(this.companyInfo.companySettings.CompanyName, Validators.required),
            orgNumber: new FormControl(this.companyInfo.companySettings.OrganizationNumber),
            address: new FormControl(this.companyInfo.companySettings.DefaultAddress.AddressLine1),
            postalCode: new FormControl(this.companyInfo.companySettings.DefaultAddress.PostalCode),
            city: new FormControl(this.companyInfo.companySettings.DefaultAddress.City),
        });

        if (this.companyInfo && this.companyInfo.isTemplate) {
            this.formGroup.disable();
            this.formGroup.controls['companyName'].enable();
        }

        this.formGroup.valueChanges.subscribe(value => {
            this.companyInfo.companySettings.CompanyName = value.companyName;
            this.companyInfo.companySettings.OrganizationNumber = value.orgNumber;
            this.companyInfo.companySettings.DefaultAddress = <Address>{
                AddressLine1: value.address,
                PostalCode: value.postalCode,
                City: value.city
            };

            this.companyInfo.valid = this.formGroup.valid;
            this.companyInfoChange.emit(this.companyInfo);
        });

        this.formGroup.controls['orgNumber'].valueChanges
            .distinctUntilChanged()
            .subscribe(orgNumber => {
                this.validateOrgNumber();
                if (orgNumber && this.isOrgNumberValid) {
                    const orgNumberTrimmed = orgNumber.replace(/\ /g, '');
                    this.businessRelationService.search(orgNumberTrimmed).subscribe(
                        res => {
                            const brRegInfo = res && res[0];
                            if (brRegInfo) {
                                this.formGroup.patchValue({
                                    companyName: brRegInfo.navn,
                                    address: brRegInfo.forretningsadr,
                                    postalCode: brRegInfo.forradrpostnr,
                                    city: brRegInfo.forradrpoststed
                                });
                            }
                        },
                        err => console.error(err)
                    );
                }
            });

        this.companyService.GetAll().subscribe((companies: Company[]) => {
            this.companies = companies;
        }, err => this.errorService.handle(err));
    }

    onIsTemplateChange() {
        if (this.companyInfo.isTemplate) {
            this.formGroup.disable();
            this.formGroup.controls['companyName'].enable();
        } else {
            this.formGroup.enable();
        }
    }

    validateOrgNumber() {
        const orgNumber = (this.formGroup.controls['orgNumber'].value || '').replace(/\ /g, '');
        if (orgNumber) {
            this.orgNumberAlreadyExists = this.companies.some(company => company.OrganizationNumber === orgNumber);
            this.isOrgNumberValid = !this.orgNumberAlreadyExists && this.modulusService.isValidOrgNr(orgNumber);
        } else {
            this.isOrgNumberValid = true;
        }
    }
}
