import {Component, ElementRef, Pipe} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, Route} from '@angular/router';
import {NgFor, NgClass} from '@angular/common';
import {ClickOutsideDirective} from '../../../../../framework/core/clickOutside';
import {routes} from '../../../../routes';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
@Pipe({name: 'removehidden'})
export class RemoveHidden {
    private transform(componentList) {
        return componentList.filter((x) => !(x.hidden || false));
    }
}

@Component({
    selector: 'uni-hamburger-menu',
    template: `
        <nav (click)="toggle($event)" (clickOutside)="close()" class="navbar_hamburger" [ngClass]="{'is-active': open}">
            <ul class="navbar_menu">
                <li class="listElement" *ngFor="let componentList of availableComponents; let idx = index"
                                        [ngClass]="{'is-active': idx === activeSection}"
                                        (mouseover)="setSectionActive(idx)">
                    {{componentList.componentListName}}
                    <ul>
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList | removehidden" (click)="navigate(component.componentUrl)">
                            {{component.componentName}}
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    `,
    directives: [ClickOutsideDirective, ROUTER_DIRECTIVES, NgFor, NgClass],
    pipes: [RemoveHidden]
})
export class HamburgerMenu {
    private open: boolean = false;

    public routes: any[] = routes;
    public availableComponents: Array<any>;
    private activeSection: number = 0;


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
                componentListHeader: 'Alt om deres økonomi',
                componentListUrl: '/',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/', moduleID: UniModules.Dashboard},
                    {componentName: 'Brukerinnstillinger', componentUrl: '/settings/user', hidden: true},
                    {componentName: 'Firmainnstillinger', componentUrl: '/settings/company', hidden: true},
                    {componentName: 'Aga-innstillinger', componentUrl: '/settings/aga-and-subentities', hidden: true},
                    {componentName: 'Legg til bruker', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Brukere og roller', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn', hidden: true}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Utgående salg',
                componentListUrl: '/sales',
                componentList: [
                    {componentName: 'Kunder', componentUrl: '/sales', moduleID: UniModules.Customers},
                    {componentName: 'Tilbud', componentUrl: '/sales/quotes', moduleID: UniModules.Quotes},
                    {componentName: 'Ordre', componentUrl: '/sales/orders', moduleID: UniModules.Orders},
                    {componentName: 'Faktura', componentUrl: '/sales/invoices', moduleID: UniModules.Invoices},
                    {componentName: 'Produkter', componentUrl: '/products', moduleID: UniModules.Products}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Orden i bøkene',
                componentListUrl: '/accounting',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting', moduleID: UniModules.Accounting},
                    {componentName: 'Leverandørfaktura', componentUrl: '/accounting/journalentry/supplierinvoices', hidden: true},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true},
                    {componentName: 'Forespørsel på konto', componentUrl: '/accounting/transquery', moduleID: UniModules.Transquery},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details', moduleID: UniModules.TransqueryDetails},
                    {componentName: 'Kontoplan', componentUrl: '/accounting/accountsettings', moduleID: UniModules.Accountsettings},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings', moduleID: UniModules.Vatsettings},
                    {componentName: 'MVA-melding', componentUrl: '/accounting/vatreport'},
                    {componentName: 'Leverandører', componentUrl: '/sales/suppliers', moduleID: UniModules.Suppliers}
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og ansatte',
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
                    {componentName: 'Timer', componentUrl: '/timetracking', moduleID: UniModules.Timesheets},
                    {componentName: 'Prosjekt', componentUrl: '/timetracking/projects'}
                ]
            },
            {
                componentListName: 'Rapporter',
                componentListHeader: 'Oversikt på papir',
                componentListUrl: '/reports',
                componentList: [
                    {componentName: 'Rapportoversikt', componentUrl: '/reports', moduleID: UniModules.Reports}
                ]
            },
            {
                componentListName: 'Dimensjoner',
                componentListHeader: 'Dimensjoner',
                componentList: [
                    {componentName: 'Prosjekt', componentUrl: '/dimensions/project'},
                    {componentName: 'Avdeling', componentUrl: '/dimensions/department'}
                ]
            }
        ];
    }

    constructor(public router: Router, private elementRef: ElementRef) {
        this.availableComponents = HamburgerMenu.getAvailableComponents();
    }

    private setSectionActive(index: number) {
        this.activeSection = index;
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

}