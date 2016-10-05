import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../../../framework/core/authService';
import {UniHttp} from '../../../../../../framework/core/http/http';
import {CompanySettingsService} from '../../../../../services/services';
import {ISelectConfig} from '../../../../../../framework/uniform/controls/select/select';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-company-dropdown',
    template: `
        <article (clickOutside)="close()" class="navbar_userinfo_company" >
            <span class="navbar_userinfo_title" (click)="companyDropdownActive = !companyDropdownActive">{{activeCompany.Name}}</span>

            <section class="navbar_userinfo_dropdown" [ngClass]="{'-is-active': companyDropdownActive}">
                <address class="companyinfo" itemtype="http://schema.org/Organization" *ngIf="company">
                    <h3 itemprop="name"> {{activeCompany.Name}} </h3>
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
                    <uni-select [config]="selectConfig"
                                [items]="availableCompanies"
                                [value]="activeCompany"
                                (valueChange)="companySelected($event)">
                    </uni-select>
                </label>
            </section>
        </article>
    `
})
export class UniCompanyDropdown {
    private activeCompany: any;
    private companyDropdownActive: Boolean;
    private company: any;

    private availableCompanies: Observable<any>;
    private selectConfig: ISelectConfig;

    constructor(private _router: Router,
                private _authService: AuthService,
                private http: UniHttp,
                private companySettingsService: CompanySettingsService) {

        this.http.asGET()
            .usingInitDomain()
            .withEndPoint('companies')
            .send()
            .map(response => response.json())
            .subscribe(response => this.availableCompanies = response);

        this.selectConfig = {
            displayProperty: 'Name'
        };

        this.companyDropdownActive = false;
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.loadCompanyData();
    }

    private loadCompanyData() {
       this.companySettingsService.Get(1, ['Phones']).subscribe((company) => {
            this.company = company;
        });
    }

    private companySelected(selectedCompany): void {
        this.close();
        this.activeCompany = selectedCompany;
        this._authService.setActiveCompany(selectedCompany);
        this.loadCompanyData();
        this._router.navigateByUrl('/');
    }

    private goToCompanySettings() {
        this.companyDropdownActive = false;
        this._router.navigateByUrl('/settings/company');
    }

    private close() {
        this.companyDropdownActive = false;
    }
}
