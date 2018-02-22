import {Component, ElementRef, Pipe, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {AuthService} from '../../../../authService';

@Pipe({name: 'removehidden'})
export class RemoveHidden {
    public transform(componentList) {
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

            <ul class="hamburger_menu" #menu (mousemove)="mouseMoveHandler($event)">
                <li class="hamburger_item"
                    *ngFor="let componentList of availableComponents; let idx = index"
                    (mouseenter)="mouseEnterHandler($event, idx)"
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HamburgerMenu {
    @ViewChild('menu')
    private sectionList: ElementRef;

    private open: boolean = false;

    public availableComponents: Array<any> = [];
    public selectionIndex: number = 0;

    // Menu aim
    private timeoutReference: any;
    private tolerance: number = 75;
    private timeout: number = 500;
    private movements: {x: number, y: number}[] = [];
    private lastDelayLocation: {x: number, y: number};


    // Get the corresponding parent app to a given module.
    public static getParentApp(moduleID): any {
        let _series = moduleID + '';
        let _seriesIndex = +_series.substring(0, _series.length - 2) - 1;
        return this.getAvailableComponents()[_seriesIndex];
    }

    constructor(
        public router: Router,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) {
        this.authService.authentication$.subscribe(auth => {
            if (auth.user) {
                this.availableComponents = this.getAllowedRoutes(auth.user);
                this.cdr.markForCheck();
            }
        });
    }

    public toggle(event) {
        if (event.target.tagName === 'NAV') {
            this.open = !this.open;
        }
    }

    public close() {
        this.open = false;
    }

    public navigate(url: string): void {
        this.open = false;
        this.router.navigateByUrl(url);
    }

    private getAllowedRoutes(user): any[] {
        let routeSections = HamburgerMenu.getAvailableComponents();

        routeSections.forEach(section => {
            section.componentList = section.componentList.filter(item => {
                return this.authService.canActivateRoute(user, item.componentUrl);
            });
        });

        routeSections = routeSections.filter(section => section.componentList.length > 0);
        return routeSections;
    }


    // Menu aim
    public mouseMoveHandler(event: MouseEvent) {
        this.movements.push({
            x: event.clientX,
            y: event.clientY
        });

        if (this.movements.length >= 3) {
            this.movements.shift();
        }
    }

    public mouseEnterHandler(event: MouseEvent, index) {
        if (this.timeoutReference) {
            clearTimeout(this.timeoutReference);
        }

        this.possiblyActivate(event.target, index);
    }

    private activationDelay() {
        let menu = this.sectionList.nativeElement;

        let offset = {left: menu.offsetLeft, top: menu.offsetTop};

        let upperLeft = {
            x: offset.left,
            y: offset.top - 75
        };

        let upperRight = {
            x: offset.left + menu.offsetWidth,
            y: upperLeft.y
        };

        let lowerLeft = {
            x: offset.left,
            y: offset.top + menu.offsetHeight + this.tolerance
        };

        let lowerRight = {
            x: offset.left + menu.offsetWidth,
            y: lowerLeft.y
        };

        let loc = this.movements[this.movements.length - 1];
        let prevLoc = this.movements[0];

        if (!loc || !prevLoc) {
            return 0;
        }

        if (this.lastDelayLocation &&
            loc.x === this.lastDelayLocation.x && loc.y === this.lastDelayLocation.y
        ) {
            // If the mouse hasn't moved since the last time we checked
            // for activation status, immediately activate.
            return 0;
        }

        let slope = (a, b) => {
            return (b.y - a.y) / (b.x - a.x);
        };

        var decreasingSlope = slope(loc, upperRight),
            increasingSlope = slope(loc, lowerRight),
            prevDecreasingSlope = slope(prevLoc, upperRight),
            prevIncreasingSlope = slope(prevLoc, lowerRight);

        if (decreasingSlope < prevDecreasingSlope &&
                increasingSlope > prevIncreasingSlope) {
            // Mouse is moving from previous location towards the
            // currently activated submenu. Delay before activating a
            // new menu row, because user may be moving into submenu.
            this.lastDelayLocation = loc;
            return this.timeout;
        }

        this.lastDelayLocation = null;
        return 0;
    }

    private possiblyActivate(element, index) {
        let delay = this.activationDelay();

        if (delay) {
            this.timeoutReference = setTimeout(() => {
                this.possiblyActivate(element, index);
            }, delay);
        } else {
            this.selectionIndex = index;
            this.cdr.markForCheck();
        }
    };


    public static getAvailableComponents(): Array<any> {
        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Nøkkeltall',
                componentListUrl: '/',
                componentList: [
                    {componentName: 'Skrivebord', componentUrl: '/', moduleID: UniModules.Dashboard},
                    {componentName: 'Selskaper', componentUrl: '/bureau', moduleID: UniModules.BureauDashboard},
                    {componentName: 'Markedsplass', componentUrl: '/marketplace', moduleID: UniModules.Marketplace},
                    {componentName: 'Oversikt', componentUrl: '/overview', moduleID: UniModules.UniTicker},
                    {componentName: 'Resultat og balanse',
                        componentUrl: '/accounting/accountingreports', moduleID: UniModules.AccountingReports},
                    {componentName: 'Rapporter', componentUrl: '/reports', moduleID: UniModules.Reports},
                    {componentName: 'Uttrekk', componentUrl: '/uniqueries', moduleID: UniModules.UniQuery},
                    {componentName: 'Mine oppgaver', componentUrl: '/assignments', moduleID: UniModules.Assignments},
                    {componentName: 'Delinger', componentUrl: '/sharings', moduleID: UniModules.Sharings}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Salg',
                componentListUrl: '/sales',
                componentList: [
                    {componentName: 'Faktura', componentUrl: '/sales/invoices',
                        moduleID: UniModules.Invoices},
                    {componentName: 'Ordre', componentUrl: '/sales/orders',
                        moduleID: UniModules.Orders},
                    {componentName: 'Tilbud', componentUrl: '/sales/quotes',
                        moduleID: UniModules.Quotes},
                    {componentName: 'Purring', componentUrl: '/sales/reminders',
                        moduleID: UniModules.Reminders},
                    {componentName: 'Kunder', componentUrl: '/sales/customer',
                        moduleID: UniModules.Customers, groupHeader: 'Register'},
                    {componentName: 'Produkter', componentUrl: '/sales/products',
                        moduleID: UniModules.Products},
                    {componentName: 'Produktgrupper', componentUrl: '/sales/productgroups',
                        moduleID: UniModules.ProductGroup},
                    {componentName: 'Selgere', componentUrl: '/sales/sellers',
                        moduleID: UniModules.Sellers},
                    {componentName: 'Valuta', componentUrl: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Regnskap og økonomi',
                componentListUrl: '/accounting',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting/journalentry',
                         moduleID: UniModules.Accounting},
                    {componentName: 'Fakturamottak', componentUrl: '/accounting/bills',
                        moduleID: UniModules.Bills},
                    {componentName: 'Åpne poster', componentUrl: '/accounting/postpost',
                        moduleID: UniModules.PostPost},
                    {componentName: 'MVA-melding', componentUrl: '/accounting/vatreport',
                        moduleID: UniModules.VatReport},
                    {componentName: 'Resultat og balanse', componentUrl: '/accounting/accountingreports',
                        moduleID: UniModules.AccountingReports},
                    {componentName: 'Søk på bilag', componentUrl: '/accounting/transquery',
                        moduleID: UniModules.TransqueryDetails, groupHeader: 'Søk'},
                    {componentName: 'Søk på konto', componentUrl: '/accounting/accountquery',
                        moduleID: UniModules.AccountQuery},
                    {componentName: 'Leverandør', componentUrl: '/accounting/suppliers',
                        moduleID: UniModules.Suppliers, groupHeader: 'Register'},
                    {componentName: 'Kontoplan', componentUrl: '/accounting/accountsettings',
                        moduleID: UniModules.Accountsettings},
                    {componentName: 'MVA-innstillinger', componentUrl: '/accounting/vatsettings',
                        moduleID: UniModules.Vatsettings},
                    {componentName: 'Valuta', componentUrl: '/currency/exchange',
                        moduleID: UniModules.CurrencyExchange},
                    {componentName: 'Prosjekt LITE', componentUrl: '/dimensions/projectslite',
                        moduleID: UniModules.Projects, groupHeader: 'Dimensjoner'},
                    {componentName: 'Avdeling', componentUrl: '/dimensions/departments',
                        moduleID: UniModules.Departments},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true}
                ]
            },
            {
                componentListName: 'Bank',
                componentListHeader: 'Bank',
                componentListUrl: '/bank',
                componentList: [
                    {componentName: 'Betalinger', componentUrl: '/bank', moduleID: UniModules.Payment}
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og personal',
                componentListUrl: '/salary',
                componentList: [
                    {componentName: 'Lønnsavregning', componentUrl: '/salary/payrollrun',
                        moduleID: UniModules.Payrollrun},
                    {componentName: 'A-Melding', componentUrl: '/salary/amelding',
                        moduleID: UniModules.Amelding},
                    {componentName: 'Saldo', componentUrl: '/salary/salarybalances',
                        moduleID: UniModules.Salarybalances},
                    {componentName: 'Tilleggsopplysninger', componentUrl: '/salary/supplements',
                        moduleID: UniModules.Supplements},
                    {componentName: 'Årsoppgave til inntektsmottaker', componentUrl: '/salary/annualstatements',
                        moduleID: UniModules.AnnualStatements},
                    {componentName: 'Ansatte', componentUrl: '/salary/employees',
                        moduleID: UniModules.Employees, groupHeader: 'Register'},
                    {componentName: 'Lønnsarter', componentUrl: '/salary/wagetypes',
                        moduleID: UniModules.Wagetypes},
                    {componentName: 'Kategorier', componentUrl: '/salary/employeecategories',
                        moduleID: UniModules.Categories},
                    {componentName: 'Altinn oversikt', componentUrl: '/salary/altinnoverview',
                        moduleID: UniModules.AltinnOverview}
                ]
            },
            {
                componentListName: 'Timer',
                componentListHeader: 'Timer',
                componentListUrl: '/timetracking',
                componentList: [
                    {componentName: 'Timemodul', componentUrl: '/timetracking',
                        moduleID: UniModules.Timesheets},
                    {componentName: 'Timeregistrering', componentUrl: '/timetracking/timeentry',
                        moduleID: UniModules.Timesheets},
                    {componentName: 'Fakturering av timer', componentUrl: '/timetracking/invoice-hours',
                        moduleID: UniModules.Timesheets},
                    {componentName: 'Personer', componentUrl: '/timetracking/workers',
                        moduleID: UniModules.Workers, groupHeader: 'Register'},
                    {componentName: 'Timearter', componentUrl: '/timetracking/worktypes',
                        moduleID: UniModules.WorkTypes},
                    {componentName: 'Stillingsmaler', componentUrl: '/timetracking/workprofiles',
                        moduleID: UniModules.WorkProfiles},
                ]
            },
            {
                componentListName: 'Prosjekt [BETA]',
                componentListHeader: 'Prosjekt [BETA]',
                componentListUrl: '/dimensions/projects',
                componentList: [
                    {componentName: 'Oversikt', componentUrl: '/dimensions/projects/overview',
                        moduleID: UniModules.Projects},
                    {componentName: 'Timer', componentUrl: '/dimensions/projects/hours',
                        moduleID: UniModules.Projects},
                    // TODO: add more when necessary
/*                  {componentName: 'Oppgaver', componentUrl: '/dimensions/projects/tasks',
                        moduleID: UniModules.Projects},
                    {componentName: 'Faktura', componentUrl: '/dimensions/projects/invoices',
                        moduleID: UniModules.Projects},
                    {componentName: 'Ordre', componentUrl: '/dimensions/projects/orders',
                        moduleID: UniModules.Projects},
                    {componentName: 'Tilbud', componentUrl: '/dimensions/projects/quotes',
                        moduleID: UniModules.Projects},
                    ,
                    {componentName: 'Inng. faktura', componentUrl: '/dimensions/projects/supplierinvoices',
                        moduleID: UniModules.Projects},
                    {componentName: 'Dokumenter', componentUrl: '/dimensions/projects/documents',
                        moduleID: UniModules.Projects},
                    {componentName: 'Redigering', componentUrl: '/dimensions/projects/editmode',
                        moduleID: UniModules.Projects} */
                ]
            },
            {
                componentListName: 'Innstillinger',
                componentListHeader: 'Innstillinger',
                componentListUrl: '/admin',
                componentList: [
                    {componentName: 'Firmaoppsett', componentUrl: '/settings/company'},
                    {componentName: 'Nummerserier', componentUrl: '/settings/numberseries'},
                    {componentName: 'Team', componentUrl: '/settings/teams'},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn'},
                    {componentName: 'Bankinnstillinger', componentUrl: '/settings/banksettings'},
                    {componentName: 'Regler', componentUrl: '/admin/thresholds', moduleID: UniModules.Thresholds},
                    {componentName: 'Integrasjon', componentUrl: '/settings/webhooks'},

                    {componentName: 'Jobber', componentUrl: '/admin/jobs',
                        moduleID: UniModules.Jobs},
                    {componentName: 'Språk', componentUrl: '/admin/languages',
                        moduleID: UniModules.Translations},
                    {componentName: 'Modeller', componentUrl: '/admin/models',
                        moduleID: UniModules.Models},
                    {componentName: 'Roller', componentUrl: '/admin/roles',
                        moduleID: UniModules.Roles},
                    {componentName: 'Versjonsinformasjon', componentUrl: '/about/versions',
                        moduleID: UniModules.Versions}
                ]
            }
        ];
    }

}
