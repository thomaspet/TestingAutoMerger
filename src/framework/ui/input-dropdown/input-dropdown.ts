import {NgModule, TemplateRef, Component, Input, ViewChild, ChangeDetectionStrategy, ContentChild, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OverlayRef, Overlay, OverlayConfig, ConnectedPosition} from '@angular/cdk/overlay';
import {PortalModule, TemplatePortalDirective} from '@angular/cdk/portal';
import {Subject} from 'rxjs';

@Component({
    selector: 'input-dropdown-menu',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section *cdkPortal class="input-dropdown-menu" (click)="$event.stopPropagation()">
            <ng-container *ngTemplateOutlet="content"></ng-container>
        </section>
    `
})
export class InputDropdownMenu {
    @ContentChild(TemplateRef) content: TemplateRef<any>;
    @ViewChild(TemplatePortalDirective) contentTemplate: TemplatePortalDirective;
    @Input() input: HTMLElement;
    @Input() visible: boolean;

    protected overlayRef: OverlayRef;
    onDestroy$ = new Subject();

    constructor(protected overlay: Overlay) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['visible'] && this.visible !== changes['visible'].previousValue) {
            if (this.visible) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();

        if (this.overlayRef) {
            this.overlayRef.detach();
        }
    }

    show() {
        this.overlayRef = this.overlay.create(this.getOverlayConfig());
        this.overlayRef.attach(this.contentTemplate);
        const refRect = this.input.getBoundingClientRect();
        this.overlayRef.updateSize({
            minWidth: refRect.width || '10rem'
        });
    }

    hide() {
        if (this.overlayRef) {
            this.visible = false;
            this.overlayRef.detach();
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
    imports: [CommonModule, OverlayModule, PortalModule],
    declarations: [InputDropdownMenu],
    exports: [InputDropdownMenu]
})
export class InputDropdownModule {}
