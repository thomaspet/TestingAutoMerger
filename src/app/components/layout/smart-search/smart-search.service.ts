import {Injectable, Injector} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {fromEvent, Subscription} from 'rxjs';
import {UniSmartSearch} from './smart-search';
import {UniCompanySearch} from './company-search/company-search';
import {KeyCodes} from '@app/services/common/keyCodes';

@Injectable()
export class SmartSearchService {
    overlayRef: OverlayRef;
    keydownSubscription: Subscription;

    constructor(
        private injector: Injector,
        private overlay: Overlay
    ) {
        this.keydownSubscription = fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (event.ctrlKey && key === KeyCodes.SPACE) {
                if (!this.overlayRef || !this.overlayRef.overlayElement) {
                    const showCompanySearch = event.shiftKey;
                    this.open(showCompanySearch);
                }
            }
        });
    }

    ngOnDestroy() {
        this.keydownSubscription?.unsubscribe();
    }

    open(showCompanySearch?: boolean) {
        const position = this.overlay
            .position()
            .global()
            .centerHorizontally()
            .top('1.5rem');

        const overlayRef = this.overlay.create({
            hasBackdrop: true,
            positionStrategy: position,
            scrollStrategy: this.overlay.scrollStrategies.block()
        });

        const component: any = showCompanySearch ? UniCompanySearch : UniSmartSearch;
        const smartSearch = new ComponentPortal(
            component,
            null,
            this.createInjector(overlayRef)
        );

        overlayRef.attach(smartSearch);
        overlayRef.backdropClick().subscribe(() => overlayRef.dispose());
        this.overlayRef = overlayRef;
    }

    createInjector(overlayRef: OverlayRef): PortalInjector {
        // Injector allows us to pass stuff to the component
        // that is opened in the overlay. In this case we pass
        // the overlay reference so the component can close "itself"
        const injectionTokens = new WeakMap();
        injectionTokens.set(OverlayRef, overlayRef);

        return new PortalInjector(this.injector, injectionTokens);
    }
}
