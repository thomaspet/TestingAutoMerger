import {Directive, Attribute, ElementRef, DynamicComponentLoader} from "angular2/core";
import {Router, RouterOutlet, ComponentInstruction} from "angular2/router";
import {AuthService} from "../framework/authentication/authService";

@Directive({
    selector: "uni-router-outlet",
})
export class UniRouterOutlet extends RouterOutlet {
    private parentRouter: Router;
    private authService: AuthService;

    constructor(elementRef: ElementRef,
                loader: DynamicComponentLoader,
                parentRouter: Router,
                @Attribute("name")
                    nameAttr: string,
                authService: AuthService) {
        super(elementRef, loader, parentRouter, nameAttr);

        this.parentRouter = parentRouter;
        this.authService = authService;
    }

    activate(instruction: ComponentInstruction) {
        var url = "/" + instruction.urlPath;

        if (!this.authService.validateAuthentication() && url !== "/login" && url !== "/signup") {
            localStorage.setItem("lastNavigationAttempt", url); // so we can redirect to it after logging in	
            this.parentRouter.navigateByUrl("/login");
        }

        return super.activate(instruction);
    }
}
