import {Component, AfterViewInit, HostListener} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {AuthService} from '../../../../../../framework/core/authService';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {CompanySettingsService} from '../../../../../services/services';

declare var jQuery;

@Component({
    selector: 'uni-company-dropdown',
    template: `
        <article class="navbar_userinfo_company" >    
            <span class="navbar_userinfo_title" (click)="companyDropdownActive = !companyDropdownActive">{{activeCompany.Name}}</span>

            <section class="navbar_userinfo_dropdown" [ngClass]="{'-is-active': companyDropdownActive}">
                <address class="companyinfo" itemtype="http://schema.org/Organization" *ngIf="company">
                    <h4 itemprop="name"> {{activeCompany.Name}} </h4>
                    <dl>
                        <dt>Org.nr</dt>
                        <dd itemprop="taxID">{{company.OrganizationNumber || ''}}</dd>
                        <dt *ngIf="company.Phones && company.Phones[0]?.Number">Telefon</dt>
                        <dd itemprop="phone" *ngIf="company.Phones && company.Phones[0]?.Number"><a href="tel:{{company.Phones[0].Number}}">{{company.Phones[0].Number}}</a></dd>
                        <dt>Regnskapsår</dt>
                        <dd>2016</dd>
                    </dl>
                </address>

                <p><a (click)="goToCompanySettings()">Innstillinger</a></p>
                <hr>

                <label class="company_select"> Velg firma
                    <select id="companySelect"></select> <!-- kendo dropdownlist will compile here -->
                </label>

            </section>
        </article>
    `,
    providers: [CompanySettingsService]
})
export class UniCompanyDropdown implements AfterViewInit {
    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private dropdownConfig: kendo.ui.DropDownListOptions;
    private company: any;

    constructor(private _router: Router, 
                private _authService: AuthService, 
                private http: UniHttp,
                private companySettingsService: CompanySettingsService) {

        this.companyDropdownActive = false;
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.loadCompanyData();

        this.dropdownConfig = {
            delay: 50,
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: {
                transport: {
                    read: (options) => {
                        this.http.asGET()
                            .usingInitDomain()
                            .withEndPoint('companies')
                            .send()
                            .subscribe(response => options.success(response));
                    }
                }
            },
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                if (dataItem.Name === this.activeCompany.Name) { return; }
                this.companySelected(dataItem);
            }
        };
    }

    @HostListener('click', ['$event'])
    private onClick() {
        event.stopPropagation();
    }

    @HostListener('document:click')
    private offClick() {
        this.companyDropdownActive = false;
    }

    private loadCompanyData() {
       this.companySettingsService.Get(1, ['Phones']).subscribe((company) => {
            this.company = company;
        });
    }

    public ngAfterViewInit() {
        var container = jQuery('#companySelect');
        var dropdown = container.kendoDropDownList(this.dropdownConfig).data('kendoDropDownList');
        dropdown.value(this.activeCompany.ID);
    }

    private companySelected(selectedCompany): void {
        this.activeCompany = selectedCompany;
        this._authService.setActiveCompany(selectedCompany);
        this.loadCompanyData();
        this._router.navigateByUrl('/');
    }

    private goToCompanySettings() {
        this.companyDropdownActive = false;
        this._router.navigateByUrl('/settings/company');
    }

}
