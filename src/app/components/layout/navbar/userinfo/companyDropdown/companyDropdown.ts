import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../../../../../../framework/core/authService';
import 'rxjs/add/observable/fromEvent';
declare var jQuery;

@Component({
    selector: 'uni-company-dropdown',
    templateUrl: 'app/components/layout/navbar/userinfo/companyDropdown/companyDropdown.html',
})
export class UniCompanyDropdown implements AfterViewInit, OnDestroy {
    private companies: Array<any>;
    private activeCompany: any;
    private clickSubscription: any;
    private companyDropdownActive: Boolean;
    private dropdownConfig: kendo.ui.DropDownListOptions;

    // TODO: GET companies from API
    private static getCompanies(): Array<any> {
        return [
            {id: 1, name: 'Uni Micro AS'},
            {id: 2, name: 'Google'},
            {id: 3, name: 'Apple'},
            {id: 4, name: 'Microsoft'},
        ];
    }

    constructor(private _router: Router, private _authService: AuthService) {
        this.companyDropdownActive = false;
        this.activeCompany = JSON.parse(localStorage.getItem('activeCompany'));
        this.companies = UniCompanyDropdown.getCompanies();

        this.dropdownConfig = {
            delay: 50,
            dataTextField: 'Name',
            dataValueField: 'ID',
            dataSource: {
                transport: {
                    read: (options) => {
                        this._authService.getCompanies()
                            .subscribe(response => options.success(response.json()));
                    }
                }
            },
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.companySelected(dataItem);
            }
        };
    }

    public ngAfterViewInit() {
        this.clickSubscription = Observable.fromEvent(document, 'click')
            .subscribe(
                (event: any) => {
                    // hide when clicking something besides the navbar item
                    if (!jQuery(event.target).closest('.navbar_userinfo_company').length
                        && !jQuery(event.target).closest('.navbar_userinfo_dropdown').length) {
                        this.companyDropdownActive = false;
                    }
                }
            );

        var container = jQuery('#companySelect');
        var dropdown = container.kendoDropDownList(this.dropdownConfig).data('kendoDropDownList');
        dropdown.value(this.activeCompany.id);
    }

    private companySelected(selectedCompany): void {
        this.activeCompany = selectedCompany;
        this._authService.setActiveCompany(selectedCompany);
        this._router.navigateByUrl('/');
    }

    private goToCompanySettings() {
        this.companyDropdownActive = false;
        this._router.navigateByUrl('/settings/company');
    }

    public ngOnDestroy() {
        this.clickSubscription.unsubscribe();
    }
}