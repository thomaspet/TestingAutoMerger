import {Component, Host, ElementRef} from 'angular2/core';
import {ROUTER_DIRECTIVES, Router, AsyncRoute} from 'angular2/router';
import {NgFor, NgClass} from 'angular2/common';
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
                    {componentName: 'Salgstall', componentUrl: '/uniformdemo'},
                    {componentName: 'Regnskap', componentUrl: '/kitchensink'}
                ]
            },
            {
                componentListName: 'Salg',
                componentListHeader: 'Utgående salg',
                componentList: [
                    {componentName: 'Faktura', componentUrl: '/kitchensink'},
                    {componentName: 'Tilbud', componentUrl: '/sales/quote'},
                    {componentName: 'Innbetaling', componentUrl: '/uniformdemo'},
                    {componentName: 'Purring', componentUrl: '/kitchensink'},
                    {componentName: 'Kunder', componentUrl: '/sales'},
                    {componentName: 'Leverandører', componentUrl: '/sales/supplier'},
                    {componentName: 'Produkter', componentUrl: '/products'},
                    {componentName: 'Prosjekter', componentUrl: '/'}
                ]
            },
            {
                componentListName: 'Regnskap',
                componentListHeader: 'Orden i bøkene',
                componentList: [
                    {componentName: 'Fakturamottak', componentUrl: '/kitchensink'},
                    {componentName: 'Bilagsføring', componentUrl: '/accounting'},
                    {componentName: 'Hovedbok', componentUrl: '/uniformdemo'},
                    {componentName: 'Forespørsel', componentUrl: '/'},
                ]
            },
            {
                componentListName: 'Lønn',
                componentListHeader: 'Lønn og ansatte',
                componentList: [
                    {componentName: 'Ansatte', componentUrl: '/salary/employees'},
                    {componentName: 'Transaksjoner', componentUrl: '/salary/salarytrans'},
                    {componentName: 'Lønnsarter', componentUrl: '/salary/wagetypes'}                    
                ]
            },
            {
                componentListName: 'Rapporter',
                componentListHeader: 'Oversikt på papir',
                componentList: [
                    {componentName: 'Rapportoversikt', componentUrl: '/'}
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
