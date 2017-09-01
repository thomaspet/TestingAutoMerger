import {Component, ElementRef, Pipe, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {routes} from '../../../../routes';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {UniMenuAim, UserService} from '../../../../services/services';
import {AuthService} from '../../../../../framework/core/authService';

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

            <ul class="hamburger_menu" #menu>
                <li class="hamburger_item"
                    *ngFor="let componentList of availableComponents; let idx = index"
                    [ngClass]="{'is-active': idx === selectionIndex}">
                    {{componentList.componentListName}}

                    <ul class="hamburger_submenu">
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList | removehidden"
                        [attr.data-header]="component.groupHeader"
                        (click)="navigate(component.componentUrl)"
                        class="hamburger_component">
                            {{component.componentName}}
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    `
})
export class HamburgerMenu {
    @ViewChild('menu')
    private sectionList: ElementRef;

    private open: boolean = false;

    public routes: any[] = routes;
    public availableComponents: Array<any> = [];
    private activeSection: HTMLElement;
    public selectionIndex: number = 0;

    // Get the corresponding parent app to a given module.
    public static getParentApp(moduleID): any {
        let _series = moduleID + '';
        let _seriesIndex = +_series.substring(0, _series.length - 2) - 1;
        return this.getAvailableComponents()[_seriesIndex];
    }

    constructor(
        public router: Router,
        private menuaim: UniMenuAim,
        private cdr: ChangeDetectorRef,
        private userService: UserService,
        private authService: AuthService
    ) {
        this.authService.authentication$.subscribe(authChange => {
            this.userService.getCurrentUser().subscribe(user => {
                this.availableComponents = this.getAllowedRoutes(user);
                this.activeSection = this.sectionList.nativeElement.children[0];
                this.cdr.markForCheck();

                // Allow list element to initialize before we start UniMenuAim
                setTimeout(() => {
                    this.menuaim.aim(this.sectionList.nativeElement, '.hamburger_item', (selectedIndex: number) => {
                        this.selectionIndex = selectedIndex;
                        this.cdr.markForCheck();
                    });
                });
            });
        });
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

    public activeSectionIndex() {
        const elems = this.sectionList.nativeElement.children;
        return [].indexOf.call(elems, this.activeSection);
    }

    private getAllowedRoutes(user): any[] {
        let routeSections = HamburgerMenu.getAvailableComponents();
        const before = performance.now();

        routeSections.forEach(section => {
            section.componentList = section.componentList.filter(item => {
                return this.userService.checkAccessToRoute(item.componentUrl, user);
            });
        });

        routeSections = routeSections.filter(section => section.componentList.length > 0);

        const after = performance.now();
        console.log((after - before) + 'ms (filtering hamburger)');

        return routeSections;
    }

    public static getAvailableComponents(): Array<any> {
        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Nøkkeltall',
                componentListUrl: '/',
                componentList: [
                    {componentName: 'Skrivebord', componentUrl: '/', moduleID: UniModules.Dashboard},
                    {componentName: 'Oversikt', componentUrl: '/tickers', moduleID: UniModules.UniTicker},
                    {componentName: 'Regnskapsoversikt', componentUrl: '/accounting/accountingreports', moduleID: UniModules.AccountingReports},
                    {componentName: 'Rapporter', componentUrl: '/reports', moduleID: UniModules.Reports},
                    {componentName: 'Uttrekk', componentUrl: '/uniqueries', moduleID: UniModules.UniQuery},
                    {componentName: 'Tildelinger', componentUrl: '/assignments', moduleID: UniModules.Assignments}
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
                    {componentName: 'Produkter', componentUrl: '/sales/products', moduleID: UniModules.Products},
                    {componentName: 'Produktgrupper', componentUrl: '/sales/productgroups/', moduleID: UniModules.ProductGroup},
                    {componentName: 'Purring', componentUrl: '/sales/reminders', moduleID: UniModules.Reminders},
                    {componentName: 'Selgere', componentUrl: '/sales/sellers', moduleID: UniModules.Sellers}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Regnskap og økonomi',
                componentListUrl: '/accounting',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting/journalentry', moduleID: UniModules.Accounting},
                    {componentName: 'Åpne poster', componentUrl: '/accounting/postpost', moduleID: UniModules.PostPost},
                    {componentName: 'Fakturamottak', componentUrl: '/accounting/bills', moduleID: UniModules.Bills},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true},
                    {componentName: 'Regnskapsoversikt', componentUrl: '/accounting/accountingreports', moduleID: UniModules.AccountingReports},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details', moduleID: UniModules.TransqueryDetails},
                    {componentName: 'Forespørsel på konto', componentUrl: '/accounting/accountquery', moduleID: UniModules.AccountQuery},
                    {componentName: 'Kontoplan', componentUrl: '/accounting/accountsettings', moduleID: UniModules.Accountsettings},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings', moduleID: UniModules.Vatsettings},
                    {componentName: 'MVA-melding', componentUrl: '/accounting/vatreport', moduleID: UniModules.VatReport},
                    {componentName: 'Leverandører', componentUrl: '/accounting/suppliers', moduleID: UniModules.Suppliers}
                ]
            },
            {
                componentListName: 'Bank',
                componentListHeader: 'Bank',
                componentListUrl: '/bank',
                componentList: [
                    {componentName: 'Utbetalingsliste', componentUrl: '/bank/payments', moduleID: UniModules.Payment},
                    {componentName: 'Utbetalinger', componentUrl: '/bank/batches', moduleID: UniModules.Payment},
                    {componentName: 'Innbetalinger', componentUrl: '/bank/customerbatches', moduleID: UniModules.Payment}
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
                    {componentName: 'A-Meldinger', componentUrl: '/salary/amelding', moduleID: UniModules.Amelding},
                    {componentName: 'Kategorier', componentUrl: '/salary/employeecategories', moduleID: UniModules.Categories},
                    {componentName: 'Saldo', componentUrl: '/salary/salarybalances', moduleID: UniModules.Salarybalances},
                    {componentName: 'Tilleggsopplysninger', componentUrl: '/salary/supplements', moduleID: UniModules.Supplements}
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
                componentListUrl: '/dimensions',
                componentList: [
                    {componentName: 'Prosjekt', componentUrl: '/dimensions/projects', moduleID: UniModules.Projects},
                    {componentName: 'Avdeling', componentUrl: '/dimensions/departments', moduleID: UniModules.Departments}
                ]
            },
            {
                componentListName: 'Valuta',
                componentListHeader: 'Valuta',
                componentListUrl: '/currency',
                componentList: [
                    {componentName: 'Valutakurser', componentUrl: '/currency/exchange', moduleID: UniModules.CurrencyExchange},
                    {componentName: 'Valutaoverstyring', componentUrl: '/currency/overrides', moduleID: UniModules.CurrencyOverride}
                ]
            },
            {
                componentListName: 'Admin',
                componentListHeader: 'Admin',
                componentListUrl: '/admin',
                componentList: [
                    {componentName: 'Jobber', componentUrl: '/admin/jobs', moduleID: UniModules.Jobs},
                    {componentName: 'Languages', componentUrl: '/admin/languages', moduleID: UniModules.Translations},
                    {componentName: 'Modeller', componentUrl: '/admin/models', moduleID: UniModules.Models},
                    {componentName: 'Roller', componentUrl: '/admin/roles', moduleID: UniModules.Roles},
                    {componentName: 'Regler', componentUrl: '/admin/thresholds', moduleID: UniModules.Thresholds}
                ]
            },
            {
                componentListName: 'Om',
                componentListHeader: 'Om',
                componentListUrl: '/about',
                componentList: [
                    {componentName: 'Versjoner', componentUrl: '/about/versions', moduleID: UniModules.Versions}
                ]
            },
            {
                componentListName: 'Innstillinger',
                componentListHeader: 'Innstillinger',
                componentListUrl: '/settings',
                componentList: [
                    {componentName: 'Brukerinnstillinger', componentUrl: '/settings/user'},
                    {componentName: 'Firmainnstillinger', componentUrl: '/settings/company'},
                    {componentName: 'Aga-innstillinger', componentUrl: '/settings/aga-and-subentities'},
                    {componentName: 'Legg til bruker', componentUrl: '/settings/users'},
                    {componentName: 'Brukere og roller', componentUrl: '/settings/users'},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn'},
                ]
            }
        ];
    }

}
