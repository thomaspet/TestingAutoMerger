import {Component, Output, EventEmitter, ViewChild, Input, AfterViewInit, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators, AbstractControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

import {CompanySettings, Address, Company} from '@uni-entities';
import {
    ModulusService,
    ErrorService,
    BusinessRelationService,
    CompanyTypeService,
    CompanyService,
} from '@app/services/services';
import { IUniSearchConfig, UniSearch } from '@uni-framework/ui/unisearch';
import { IBrRegCompanyInfo } from '@uni-framework/uni-modal';

const MAX_RESULTS = 50;

export interface CompanyInfo {
    companySettings: CompanySettings;
    valid: boolean;
}

@Component({
    selector: 'uni-select-company',
    templateUrl: './select-company.component.html',
    styleUrls: ['./select-company.component.sass']
})
export class SelectCompanyComponent implements AfterViewInit, OnInit {
    @Input() companyInfo: CompanyInfo;
    @Output() companyInfoChange = new EventEmitter<CompanyInfo>();

    @ViewChild('companyName') companyNameSearch: UniSearch;
    @ViewChild('orgNo') orgNoSearch: UniSearch;

    companyNameSearchConfig: IUniSearchConfig;
    orgNumberSearchConfig: IUniSearchConfig;
    companyData: FormGroup;
    orgNumberAlreadyExists = false;
    isCompanyNameFieldTouched = false;
    isOrgNumberFieldTouched = false;
    isOrgNumberValid = true;

    private companies: Company[] = [];

    constructor(
        private businessRelationService: BusinessRelationService,
        private companyService: CompanyService,
        private companyTypeService: CompanyTypeService,
        private modulusService: ModulusService,
        private errorService: ErrorService,
    ) {}

    ngAfterViewInit() {
        this.companyNameSearch.setValue(this.companyInfo.companySettings.CompanyName || '');
        this.orgNoSearch.setValue(this.companyInfo.companySettings.OrganizationNumber || '');
    }

    ngOnInit() {
        this.companyData = new FormGroup({
            companyName: new FormControl(this.companyInfo.companySettings.CompanyName, Validators.required),
            orgNumber: new FormControl(this.companyInfo.companySettings.OrganizationNumber),
            address: new FormControl(this.companyInfo.companySettings.DefaultAddress.AddressLine1),
            postalCode: new FormControl(this.companyInfo.companySettings.DefaultAddress.PostalCode),
            city: new FormControl(this.companyInfo.companySettings.DefaultAddress.City),
        });

        this.companyNameSearchConfig = <IUniSearchConfig>{
            lookupFn: searchTerm => {
                return this.businessRelationService.search(searchTerm)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
            },
            onSelect: (selectedItem: IBrRegCompanyInfo) => {
                return this.companyTypeService.GetAll(null)
                    .catch((err, obs) => this.errorService.handleRxCatch(err, obs))
                    .map(companyTypes => {
                        this.businessRelationService.updateCompanySettingsWithBrreg(
                            this.companyInfo.companySettings,
                            selectedItem,
                            companyTypes,
                        );

                        if (selectedItem) {
                            this.companyData.patchValue({
                                companyName: selectedItem.navn,
                                orgNumber: selectedItem.orgnr,
                                address: selectedItem.forretningsadr,
                                postalCode: selectedItem.forradrpostnr,
                                city: selectedItem.forradrpoststed,
                            });
                            this.companyNameSearch.setValue(selectedItem.navn || '');
                            this.orgNoSearch.setValue(selectedItem.orgnr || '');
                            this.validateOrgNumber();
                        }
                        return this.companyInfo.companySettings;
                    });
            },
            initialItem$: new BehaviorSubject(null),
            tableHeader: ['Navn', 'Org. nr.'],
            rowTemplateFn: (item: IBrRegCompanyInfo) => [
                item.navn,
                item.orgnr,
            ],
            inputTemplateFn: (item: CompanySettings) => item.CompanyName,
            maxResultsLength: MAX_RESULTS,
            disableSearchButton: true,
        };

        this.orgNumberSearchConfig = Object.assign({}, this.companyNameSearchConfig);
        this.orgNumberSearchConfig.lookupFn = searchTerm => {
            const orgNumber = (searchTerm || '').replace(/\ /g, '');
            return this.businessRelationService.search(orgNumber)
                .catch((err, obs) => this.errorService.handleRxCatch(err, obs));
        },
        this.orgNumberSearchConfig.inputTemplateFn = (item: CompanySettings) => item.OrganizationNumber;

        this.companyData.valueChanges.subscribe(value => {
            this.companyInfo.companySettings.CompanyName = value.companyName;
            this.companyInfo.companySettings.OrganizationNumber = value.orgNumber;
            this.companyInfo.companySettings.DefaultAddress = <Address>{
                AddressLine1: value.address,
                PostalCode: value.postalCode,
                City: value.city
            };
            this.companyInfo.valid = this.companyData.valid;
            this.companyInfoChange.emit(this.companyInfo);
        });

        this.companyService.GetAll().subscribe((companies: Company[]) => {
            this.companies = companies;
        }, err => this.errorService.handle(err));
    }

    onKeyUp(formControlName: string) {
        if (formControlName === 'companyName') {
            this.companyData.controls['companyName'].setValue(this.companyNameSearch.NativeInput.value || '');
        } else if (formControlName === 'orgNumber') {
            const orgNumber = (this.orgNoSearch.NativeInput.value || '').replace(/\ /g, '');
            this.companyData.controls['orgNumber'].setValue(orgNumber);
        }
    }

    validateOrgNumber() {
        const orgNumber = (this.companyData.controls['orgNumber'].value || '').replace(/\ /g, '');
        this.orgNumberAlreadyExists = this.companies.some(company => company.OrganizationNumber === orgNumber);
        if (!orgNumber || !this.modulusService.isValidOrgNr(orgNumber) || this.orgNumberAlreadyExists) {
            this.isOrgNumberValid = false;
        } else {
            this.isOrgNumberValid = true;
        }
    }

}
