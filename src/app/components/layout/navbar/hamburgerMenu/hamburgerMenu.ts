import {Component, Host, ElementRef} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, AsyncRoute} from '@angular/router-deprecated';
import {NgFor, NgClass} from '@angular/common';
import {ROUTES} from '../../../../route.config';
declare var jQuery;

@Component({
    selector: 'uni-hamburger-menu',
    templateUrl: 'app/components/layout/navbar/hamburgerMenu/hamburgerMenu.html',
    directives: [ROUTER_DIRECTIVES, NgFor, NgClass],
    host: {
        '(document:click)': 'onClick($event)'
    }
})
export class HamburgerMenu {
    public routes: AsyncRoute[] = ROUTES;
    public availableComponents: Array<any>;

    public static getAvailableComponents(): Array<any> {


        return [
            {
                componentListName: 'Nøkkeltall',
                componentListHeader: 'Alt om deres økonomi',
                componentList: [
                    {componentName: 'Nøkkeltall', componentUrl: '/'},
                    {componentName: 'Regnskap', componentUrl: '/accounting'}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Utgående salg',
                componentList: [
                    {componentName: 'Kunder', componentUrl: '/sales'},
                    {componentName: 'Leverandører', componentUrl: '/sales/supplier'},
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

    private closeNavbar() {
        jQuery('.navbar_hamburger').removeClass('is-active');
    }

    private onClick(event) {
        let target = jQuery(event.target);

        // Close on clicks outside
        if (!target.parents(this.elementRef.nativeElement).length) {
            this.closeNavbar();
            return;
        }

        if (target.hasClass('navbar_hamburger')) {
            target.toggleClass('is-active');
        }
    }

    private navigate(url: string): void {
        this.closeNavbar();
        this.router.navigateByUrl(url);
    }
}
