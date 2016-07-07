import {Component, ElementRef, Pipe} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {NgFor, NgClass} from '@angular/common';
import {ROUTES} from '../../../../route.config';
import {ClickOutsideDirective} from '../../../../../framework/core/clickOutside';

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

    public routes: AsyncRoute[] = ROUTES;
    public availableComponents: Array<any>;
    private activeSection: number = 0;

    public static getAvailableComponents(): Array<any> {
        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Alt om deres økonomi',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/'},
                    {componentName: 'Brukerinnstillinger', componentUrl: '/settings/user', hidden: true},
                    {componentName: 'Firmainnstillinger', componentUrl: '/settings/company', hidden: true},
                    {componentName: 'AGA innstillinger', componentUrl: '/settings/agaandsubentities', hidden: true},
                    {componentName: 'Legg til bruker', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Brukere og roller', componentUrl: '/settings/users', hidden: true},
                    {componentName: 'Altinn', componentUrl: '/settings/altinn', hidden: true}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Utgående salg',
                componentList: [
                    {componentName: 'Kunder', componentUrl: '/sales'},
                    {componentName: 'Tilbud', componentUrl: '/sales/quote'},
                    {componentName: 'Ordre', componentUrl: '/sales/order'},
                    {componentName: 'Faktura', componentUrl: '/sales/invoice'},
                    {componentName: 'Produkter', componentUrl: '/products'}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Orden i bøkene',
                componentList: [
                    {componentName: 'Bilagsføring', componentUrl: '/accounting'},  
                    {componentName: 'Leverandørfaktura', componentUrl: '/accounting/journalentry/supplierinvoices/list', hidden: true},
                    {componentName: 'Betaling', componentUrl: '/accounting/journalentry/payments', hidden: true}, 
                    {componentName: 'Forespørsel på konto', componentUrl: '/accounting/transquery'},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details'},
                    {componentName: 'Kontoinnstillinger', componentUrl: '/accounting/accountsettings'},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings'},
                    {componentName: 'MVA oppgave', componentUrl: '/accounting/vatreport'},                   
                    {componentName: 'Leverandører', componentUrl: '/sales/supplier'}
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og ansatte',
                componentList: [
                    {componentName: 'Ansatte', componentUrl: '/salary/employees'},
                    {componentName: 'Lønnsarter', componentUrl: '/salary/wagetypes'},
                    {componentName: 'Lønnsavregninger', componentUrl: '/salary/payrollrun'}
                ]
            },
            {
                componentListName: 'Timer',
                componentListHeader: 'Timer',
                componentList: [
                    {componentName: 'Stillingsmaler', componentUrl: '/timetracking/workprofiles'},                    
                    {componentName: 'Personer', componentUrl: '/timetracking/workers'},
                    {componentName: 'Timearter', componentUrl: '/timetracking/worktypes'},                    
                    {componentName: 'Prosjekt', componentUrl: '/timetracking/projects'},
                    {componentName: 'Registrere timer', componentUrl: '/timetracking'}
                ]
            },            
            {
                componentListName: 'Rapporter',
                componentListHeader: 'Oversikt på papir',
                componentList: [
                    {componentName: 'Rapportoversikt', componentUrl: '/reports'}
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
