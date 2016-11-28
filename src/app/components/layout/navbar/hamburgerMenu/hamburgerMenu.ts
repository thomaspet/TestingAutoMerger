import {Component, ElementRef, Pipe} from '@angular/core';
import {Router} from '@angular/router';
import {routes} from '../../../../routes';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniMenuAim} from '../../../../services/common/UniMenuAim';

@Pipe({name: 'removehidden'})
export class RemoveHidden {
    private transform(componentList) {
        return componentList.filter((x) => !(x.hidden || false));
    }
}

@Component({
    selector: 'uni-hamburger-menu',
    template: `
        <nav class="hamburger"
            [ngClass]="{'is-active': open}"
            (click)="toggle($event)"
            (clickOutside)="close()">

            <ul class="hamburger_menu">

                <li class="hamburger_item"
                    *ngFor="let componentList of availableComponents; let idx = index"
                    [ngClass]="{'is-active': idx === activeSectionIndex()}">
                    {{componentList.componentListName}}

                    <ul class="hamburger_submenu">
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList | removehidden"
                            (click)="navigate(component.componentUrl)">
                            {{component.componentName}}
                        </li>
                    </ul>

                </li>

            </ul>

        </nav>
    `
})
export class HamburgerMenu {
    private open: boolean = false;

    public routes: any[] = routes;
    public availableComponents: Array<any>;
    private activeSection: HTMLElement;

    // Get the corresponding parent app to a given module.
    public static getParentApp(moduleID): any {
        let _series = moduleID + '';
        let _seriesIndex = +_series.slice(0, 1) - 1;
        return this.getAvailableComponents()[_seriesIndex];
    }

    public static getAvailableComponents(): Array<any> {
        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Nøkkeltall',
                componentListUrl: '/',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/', moduleID: UniModules.Dashboard},
                    {componentName: 'Brukerinnstillinger', componentUrl: '/settings/user', hidden: true},
                    {componentName: 'Firmainnstillinger', componentUrl: '/settings/company', hidden: true},
                    {componentName: 'Aga-innstillinger', componentUrl: '/settings/aga-and-subentities', hidden: true},
                    {componentName: 'Legg til bruker', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Brukere og roller', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn', hidden: true},
                    {componentName: 'Regnskapsoversikt', componentUrl: '/accounting/accountingreports', moduleID: UniModules.AccountingReports},
                    {componentName: 'Rapportoversikt', componentUrl: '/reports', moduleID: UniModules.Reports},
                    {componentName: 'Oversikt over uttrekk', componentUrl: '/uniqueries', moduleID: UniModules.UniQuery}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Salg',
                componentListUrl: '/sales',
                componentList: [
                    {componentName: 'Kunder', componentUrl: '/sales/customer', moduleID: UniModules.Customers},
                    {componentName: 'Tilbud', componentUrl: '/sales/quotes', moduleID: UniModules.Quotes},
                    {componentName: 'Ordre', componentUrl: '/sales/orders', moduleID: UniModules.Orders},
                    {componentName: 'Faktura', componentUrl: '/sales/invoices', moduleID: UniModules.Invoices},
                    {componentName: 'Produkter', componentUrl: '/products', moduleID: UniModules.Products}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Regnskap og økonomi',
                componentListUrl: '/accounting',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting', moduleID: UniModules.Accounting},
                    {componentName: 'Fakturamottak', componentUrl: '/accounting/bills', moduleID: UniModules.Bills},
                    {componentName: 'Leverandørfaktura', componentUrl: '/accounting/journalentry/supplierinvoices', hidden: true},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true},
                    {componentName: 'Regnskapsoversikt', componentUrl: '/accounting/accountingreports', moduleID: UniModules.AccountingReports},
                    // KE: This is not really needed anymore - I'll just hide it for now, but the components should be removed when BA has approved new solution
                    // {componentName: 'Forespørsel på konto', componentUrl: '/accounting/transquery', moduleID: UniModules.Transquery},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details', moduleID: UniModules.TransqueryDetails},
                    {componentName: 'Kontoplan', componentUrl: '/accounting/accountsettings', moduleID: UniModules.Accountsettings},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings', moduleID: UniModules.Vatsettings},
                    {componentName: 'MVA-melding', componentUrl: '/accounting/vatreport', moduleID: UniModules.VatReport},
                    {componentName: 'Leverandører', componentUrl: '/sales/suppliers', moduleID: UniModules.Suppliers}
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og personal',
                componentListUrl: '/salary',
                componentList: [
                    {componentName: 'Ansatte', componentUrl: '/salary/employees', moduleID: UniModules.Employees},
                    {componentName: 'Lønnsarter', componentUrl: '/salary/wagetypes', moduleID: UniModules.Wagetypes},
                    {componentName: 'Lønnsavregninger', componentUrl: '/salary/payrollrun', moduleID: UniModules.Payrollrun},
                    {componentName: 'A-Meldinger', componentUrl: '/salary/amelding', moduleID: UniModules.Amelding}
                ]
            },
            {
                componentListName: 'Timer',
                componentListHeader: 'Timer',
                componentListUrl: '/timetracking',
                componentList: [
                    {componentName: 'Stillingsmal', componentUrl: '/timetracking/workprofiles', moduleID: UniModules.WorkProfiles},
                    {componentName: 'Personer', componentUrl: '/timetracking/workers', moduleID: UniModules.Workers},
                    {componentName: 'Timearter', componentUrl: '/timetracking/worktypes', moduleID: UniModules.WorkTypes},
                    {componentName: 'Timer', componentUrl: '/timetracking', moduleID: UniModules.Timesheets}
                ]
            },
            {
                componentListName: 'Dimensjoner',
                componentListHeader: 'Dimensjoner',
                componentList: [
                    {componentName: 'Prosjekt', componentUrl: '/dimensions/project', moduleID: UniModules.Projects},
                    {componentName: 'Avdeling', componentUrl: '/dimensions/department', moduleID: UniModules.Departments}
                ]
            }
        ];
    }

    constructor(public router: Router, private elementRef: ElementRef, private menuaim: UniMenuAim) {
        this.availableComponents = HamburgerMenu.getAvailableComponents();
    }

    private setSectionActive(elem) {
        this.activeSection = elem;
    }

    private toggle(event) {
        if (event.target.tagName === 'NAV') {
            this.open = !this.open;
        }
    }

    private close() {
        this.open = false;
    }

    private navigate(url: string): void {
        this.open = false;
        this.router.navigateByUrl(url);
    }

    public ngAfterViewInit() {
        this.menuaim.aim(this.elementRef.nativeElement.querySelectorAll('.hamburger_menu')[0], '.hamburger_item', this.setSectionActive.bind(this));
        this.activeSection = this.elementRef.nativeElement.querySelectorAll('.hamburger_item:first-of-type')[0];
    }

    private activeSectionIndex() {
        let elems = this.elementRef.nativeElement.querySelectorAll('.hamburger_item');
        return [].indexOf.call(elems, this.activeSection);
    }

}
