import {Injectable, Injector} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {Observable} from 'rxjs/Observable';
import {UniSmartSearch} from './smart-search';
import {KeyCodes} from '@app/services/common/keyCodes';

@Injectable()
export class SmartSearchService {
    overlayRef: OverlayRef;

    constructor(
        private injector: Injector,
        private overlay: Overlay
    ) {
        Observable.fromEvent(document, 'keydown').subscribe((event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            if (event.ctrlKey && key === KeyCodes.SPACE) {
                if (!this.overlayRef || !this.overlayRef.overlayElement) {
                    this.open();
                }
            }
        });
    }

    open() {
        const position = this.overlay
            .position()
            .global()
            .centerHorizontally();

        const overlayRef = this.overlay.create({
            hasBackdrop: true,
            positionStrategy: position,
            scrollStrategy: this.overlay.scrollStrategies.block()
        });

        const smartSearch = new ComponentPortal(
            UniSmartSearch,
            null,
            this.createInjector(overlayRef)
        );

        overlayRef.attach(smartSearch);

        // TODO: fix positioning so backdrop click works

        // overlayRef.backdropClick().subscribe(() => overlayRef.dispose());

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
