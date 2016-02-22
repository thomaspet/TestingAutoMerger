import {Component, AfterViewInit, OnDestroy} from "angular2/core";
import {Router} from "angular2/router"
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";

declare var jQuery;

@Component({
    selector: "uni-company-dropdown",
    templateUrl: "app/components/layout/navbar/userinfo/companyDropdown/companyDropdown.html",
})
export class UniCompanyDropdown implements AfterViewInit, OnDestroy {
    companies: Array<any>;
    activeCompany: any;
    clickSubscription: any;
    companyDropdownActive: Boolean;
    dropdownConfig: kendo.ui.DropDownListOptions;

    // how to get companies? Already gotten?
    static getCompanies(): Array<any> {
        return [
            {id: 1, name: "Uni Micro AS"},
            {id: 2, name: "Google"},
            {id: 3, name: "Apple"},
            {id: 4, name: "Microsoft"},
        ]
    }

    constructor(private router: Router) {
        this.companyDropdownActive = false;
        this.activeCompany = JSON.parse(localStorage.getItem("activeCompany"));
        this.companies = UniCompanyDropdown.getCompanies();

        this.dropdownConfig = {
            delay: 50,
            dataTextField: "name",
            dataValueField: "id",
            dataSource: [
                {id: 1, name: "Unimicro AS"},
                {id: 2, name: "Google"},
                {id: 3, name: "Apple"},
                {id: 4, name: "Microsoft"},
            ],
            select: (event: kendo.ui.DropDownListSelectEvent) => {
                var item: any = event.item;
                var dataItem = event.sender.dataItem(item.index());
                this.companySelected(dataItem);
            }
        }
    }

    ngAfterViewInit() {
        this.clickSubscription = Observable.fromEvent(document, "click")
            .subscribe(
                (event: any) => {
                    // hide when clicking something besides the navbar item
                    if (!jQuery(event.target).closest(".navbar_userinfo_company").length
                        && !jQuery(event.target).closest(".navbar_userinfo_dropdown").length) {
                        this.companyDropdownActive = false;
                    }
                }
            );

        var container = jQuery("#companySelect");
        var dropdown = container.kendoDropDownList(this.dropdownConfig).data("kendoDropDownList");
        dropdown.value(this.activeCompany.id);
    }

    companySelected(selectedCompany): void {
        console.log(selectedCompany.name);
        localStorage.setItem("activeCompany", JSON.stringify(selectedCompany));
        this.activeCompany = selectedCompany;
        this.router.navigateByUrl("/");
    }

    goToCompanySettings() {
        this.companyDropdownActive = false;
        // this.router.navigate(["CompanySettings", { id: this.activeCompany.id }]);
        this.router.navigateByUrl("/settings/company");
    }

    ngOnDestroy() {
        this.clickSubscription.unsubscribe();
    }
}