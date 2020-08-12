import {NgModule, TemplateRef, Component, Input, ViewChild, ChangeDetectionStrategy, ContentChild, Directive} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OverlayRef, Overlay, OverlayConfig, ConnectedPosition} from '@angular/cdk/overlay';
import {PortalModule, CdkPortal} from '@angular/cdk/portal';
import {fromEvent, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
    selector: 'dropdown-menu',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section *cdkPortal class="dropdown-menu" (click)="closeOnClick && hide()">
            <ng-container *ngTemplateOutlet="content"></ng-container>
        </section>
    `
})
export class DropdownMenu {
    @ContentChild(TemplateRef, {static: true}) content: TemplateRef<any>;
    @ViewChild(CdkPortal, { static: true }) contentTemplate: CdkPortal;
    @Input() trigger: any;
    @Input() minWidth: number | string;
    @Input() alignRight: boolean;
    @Input() closeOnClick: boolean = true;

    protected overlayRef: OverlayRef;
    clickSubscription: Subscription;
    visible: boolean;
    element: HTMLElement;

    constructor(protected overlay: Overlay) {}

    ngOnChanges(changes) {
        if (changes['trigger'] && this.trigger) {
            try {
                if (this.clickSubscription) {
                    this.clickSubscription.unsubscribe();
                }

                if (this.trigger.nodeType) {
                    this.element = this.trigger;
                } else if (this.trigger.elementRef) {
                    this.element = this.trigger.elementRef.nativeElement;
                } else {
                    this.element = undefined;
                    console.warn('Missing/invalid trigger for dropdown-menu.ts');
                }

                if (this.element) {
                    this.clickSubscription = fromEvent(this.element, 'click').subscribe(() => {
                        if (this.visible) {
                            this.hide();
                        } else {
                            this.show();
                        }
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    ngOnDestroy() {
        this.hide();
        if (this.clickSubscription) {
            this.clickSubscription.unsubscribe();
        }
    }

    show() {
        this.overlayRef = this.overlay.create(this.getOverlayConfig());
        this.overlayRef.attach(this.contentTemplate);
        this.syncWidth();
        this.overlayRef.backdropClick().pipe(take(1)).subscribe(() => this.hide());
        this.visible = true;
    }

    hide() {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.visible = false;
        }
    }

    protected getOverlayConfig(): OverlayConfig {
        const prefXPos = this.alignRight ? 'end' : 'start';
        const altXPos = this.alignRight ? 'start' : 'end';

        const positions: ConnectedPosition[] = [
            {
                originX: prefXPos,
                originY: 'bottom',
                overlayX: prefXPos,
                overlayY: 'top'
            },
            {
                originX: altXPos,
                originY: 'bottom',
                overlayX: altXPos,
                overlayY: 'top'
            },
            {
                originX: prefXPos,
                originY: 'top',
                overlayX: prefXPos,
                overlayY: 'bottom'
            },
            {
                originX: altXPos,
                originY: 'top',
                overlayX: altXPos,
                overlayY: 'bottom'
            },
        ];

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.element)
            .withPush(false)
            .withPositions(positions);

        const scrollStrategy = this.overlay.scrollStrategies.reposition();

        return new OverlayConfig({
            positionStrategy: positionStrategy,
            scrollStrategy: scrollStrategy,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop'
        });
    }

    private syncWidth() {
        if (this.overlayRef) {
            const refRect = this.element.getBoundingClientRect();
            this.overlayRef.updateSize({
                minWidth: this.minWidth || refRect.width || '10rem'
            });
        }
    }
}


@NgModule({
    imports: [CommonModule, OverlayModule, PortalModule],
    declarations: [DropdownMenu],
    exports: [DropdownMenu]
})
export class DropdownMenuModule {}
