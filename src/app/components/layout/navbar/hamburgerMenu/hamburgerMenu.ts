import {Component, Host, ElementRef} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {NgFor, NgClass} from '@angular/common';
import {ROUTES} from '../../../../route.config';
declare var jQuery;

@Component({
    selector: 'uni-hamburger-menu',
    template: `
        <nav class="navbar_hamburger" [ngClass]="{'is-active': open}">
            <ul class="navbar_menu">
                <li *ngFor="let componentList of availableComponents; let i = index" class="listElement" [ngClass]="{true:'is-active', false:''}[i==0]">
                    {{componentList.componentListName}}
                    <ul>
                        <h3>{{componentList.componentListHeader}}</h3>
                        <li *ngFor="let component of componentList.componentList" (click)="navigate(component.componentUrl)">
                            {{component.componentName}}
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>
    `,
    directives: [ROUTER_DIRECTIVES, NgFor, NgClass],
    host: {
        '(click)': 'onClick($event)',
        '(document:click)': 'offClick()'
    }
})
export class HamburgerMenu {
    private open: boolean = false;

    public routes: AsyncRoute[] = ROUTES;
    public availableComponents: Array<any>;

    public static getAvailableComponents(): Array<any> {


        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Alt om deres økonomi',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/'}
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
                    {componentName: 'Forespørsel på konto', componentUrl: '/accounting/transquery'},
                    {componentName: 'Forespørsel på bilag', componentUrl: '/accounting/transquery/details'},
                    {componentName: 'Kontoinnstillinger', componentUrl: '/accounting/accountsettings'},
                    {componentName: 'MVA innstillinger', componentUrl: '/accounting/vatsettings'},                    
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
                    {componentName: 'Stillingsmaler', componentUrl: '/timetracking/workprofile'},                    
                    {componentName: 'Personer', componentUrl: '/timetracking/worker'},
                    {componentName: 'Timearter', componentUrl: '/timetracking/worktype'},                    
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

    public ngAfterViewInit() {
        jQuery('.listElement').mouseover(function() {
            jQuery(this).addClass('is-active');
            jQuery(this).siblings().removeClass('is-active');
        });
    }

    private onClick(event) {
        event.stopPropagation();
        if (event.target.tagName === 'NAV') {
            this.open = !this.open;
        }
    }

    private offClick() {
        this.open = false;
    }

    private navigate(url: string): void {
        this.open = false;
        this.router.navigateByUrl(url);
    }
}
