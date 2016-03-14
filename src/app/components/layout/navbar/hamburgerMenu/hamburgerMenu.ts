import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES, Router} from "angular2/router";
import {NgFor, NgClass} from "angular2/common";
import {Routes} from "../../../../route.config";
declare var jQuery;

@Component({
    selector: "uni-hamburger-menu",
    templateUrl: "app/components/layout/navbar/hamburgerMenu/hamburgerMenu.html",
    directives: [ROUTER_DIRECTIVES, NgFor, NgClass]
})
export class HamburgerMenu {
    public routes = Routes;
    availableComponents: Array<any>;

    static getAvailableComponents(): Array<any> {


        return [
            {
                componentListName: "Nøkkeltall",
                componentListHeader: "Alt om deres økonomi",
                componentList: [
                    {componentName: "Nøkkeltall", componentUrl: "/"},
                    {componentName: "Salgstall", componentUrl: "/uniformdemo"},
                    {componentName: "Regnskap", componentUrl: "/kitchensink"}
                ]
            },
            {
                componentListName: "Salg",
                componentListHeader: "Utgående salg",
                componentList: [
                    {componentName: "Faktura", componentUrl: "/kitchensink"},
                    {componentName: "Tilbud", componentUrl: "/"},
                    {componentName: "Innbetaling", componentUrl: "/uniformdemo"},
                    {componentName: "Purring", componentUrl: "/kitchensink"},
                    {componentName: "Kunder", componentUrl: "/customer"},
                    {componentName: "Produkter", componentUrl: "/uniformdemo"},
                    {componentName: "Prosjekter", componentUrl: "/"}
                ]
            },
            {
                componentListName: "Regnskap",
                componentListHeader: "Orden i bøkene",
                componentList: [
                    {componentName: "Fakturamottak", componentUrl: "/kitchensink"},
                    {componentName: "Bilagsføring", componentUrl: "/journalentry"},
                    {componentName: "Hovedbok", componentUrl: "/uniformdemo"},
                    {componentName: "Forespørsel", componentUrl: "/"},
                ]
            },
            {
                componentListName: "Lønn",
                componentListHeader: "Lønn og ansatte",
                componentList: [
                    {componentName: "Ansatt", componentUrl: "/kitchensink"},
                    {componentName: "Stillinger", componentUrl: "/"}
                ]
            },
            {
                componentListName: "Rapporter",
                componentListHeader: "Oversikt på papir",
                componentList: [
                    {componentName: "Rapportoversikt", componentUrl: "/"}
                ]
            }
        ];
    }

    constructor(public router: Router) {
        this.availableComponents = HamburgerMenu.getAvailableComponents();
    }

    openBurgerMenu(): void {
        jQuery(".navbar_hamburger").toggleClass("is-active");

        jQuery(".listElement").mouseover(function () {
            jQuery(this).addClass("is-active");
            jQuery(this).siblings().removeClass("is-active");
        });
    }


    navigate(url: string): void {
        this.router.navigateByUrl(url);
    }

}
