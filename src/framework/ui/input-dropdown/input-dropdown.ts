import {NgModule, TemplateRef, Component, Input, ViewChild, ChangeDetectionStrategy, ContentChild, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OverlayRef, Overlay, OverlayConfig, ConnectedPosition, OverlaySizeConfig} from '@angular/cdk/overlay';
import {PortalModule, CdkPortal} from '@angular/cdk/portal';
import {ObserversModule} from '@angular/cdk/observers';

@Component({
    selector: 'input-dropdown-menu',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section (cdkObserveContent)="onContentChange()" *cdkPortal class="input-dropdown-menu" (click)="$event.stopPropagation()">
            <ng-container *ngTemplateOutlet="content"></ng-container>
        </section>
    `
})
export class InputDropdownMenu {
    @ContentChild(TemplateRef, {static: true}) content: TemplateRef<any>;
    @ViewChild(CdkPortal, { static: true }) contentTemplate: CdkPortal;
    @Input() input: HTMLElement;
    @Input() visible: boolean;

    protected overlayRef: OverlayRef;

    sizeConfig: OverlaySizeConfig;

    constructor(protected overlay: Overlay) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['visible']) {
            // !! because it might not be a boolean
            const current = !!this.visible;
            const previous = !!changes['visible'].previousValue;

            if (current !== previous) {
                if (this.visible) {
                    this.show();
                } else {
                    this.hide();
                }
            }
        }
    }

    onContentChange() {
        if (this.overlayRef) {
            this.overlayRef.updatePosition();
            this.overlayRef.updateSize(this.sizeConfig);
        }
    }

    ngOnDestroy() {
        this.hide();
    }

    show() {
        if (this.overlayRef && this.overlayRef.dispose) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
        }

        this.overlayRef = this.overlay.create(this.getOverlayConfig());
        this.overlayRef.attach(this.contentTemplate);
        const refRect = this.input.getBoundingClientRect();

        this.sizeConfig = {
            minWidth: refRect.width || '10rem',
            maxHeight: '100%'
        };

        this.overlayRef.updateSize(this.sizeConfig);
    }

    hide() {
        if (this.overlayRef) {
            this.visible = false;
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.overlayRef = undefined;
        }
    }

    protected getOverlayConfig(): OverlayConfig {
        const positions: ConnectedPosition[] = [
            {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top'
            },
            {
                originX: 'end',
                originY: 'bottom',
                overlayX: 'end',
                overlayY: 'top'
            },
            {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom'
            },
            {
                originX: 'end',
                originY: 'top',
                overlayX: 'end',
                overlayY: 'bottom'
            },
        ];

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.input)
            .withPush(false)
            .withPositions(positions);

        const scrollStrategy = this.overlay.scrollStrategies.reposition();

        return new OverlayConfig({
            positionStrategy: positionStrategy,
            scrollStrategy: scrollStrategy,
        });
    }
}

@NgModule({
    imports: [CommonModule, OverlayModule, PortalModule, ObserversModule],
    declarations: [InputDropdownMenu],
    exports: [InputDropdownMenu]
})
export class InputDropdownModule {}
