import {NgModule, TemplateRef, Component, Input, ViewChild, ChangeDetectionStrategy, ContentChild, Directive} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, OverlayRef, Overlay, OverlayConfig, ConnectedPosition} from '@angular/cdk/overlay';
import {PortalModule, TemplatePortalDirective} from '@angular/cdk/portal';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil, take} from 'rxjs/operators';

@Component({
    selector: 'dropdown-menu',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section *cdkPortal class="dropdown-menu" (click)="hide()">
            <ng-container *ngTemplateOutlet="content"></ng-container>
        </section>
    `
})
export class DropdownMenu {
    @ContentChild(TemplateRef) content: TemplateRef<any>;
    @ViewChild(TemplatePortalDirective) contentTemplate: TemplatePortalDirective;
    @Input() trigger: HTMLElement;
    @Input() minWidth: number | string;
    @Input() alignRight: boolean;

    protected overlayRef: OverlayRef;
    onDestroy$ = new Subject();
    visible: boolean;

    constructor(protected overlay: Overlay) {}

    ngAfterViewInit() {
        if (this.trigger) {
            fromEvent(this.trigger, 'click').pipe(
                takeUntil(this.onDestroy$)
            ).subscribe(() => {
                if (this.visible) {
                    this.hide();
                } else {
                    this.show();
                }
            });
        } else {
            console.warn('Missing trigger for DropdownMenu, add: [trigger]="<reference to toggle element>"');
        }
    }

    ngOnDestroy() {
        this.hide();
        this.onDestroy$.next();
        this.onDestroy$.complete();
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
            .flexibleConnectedTo(this.trigger)
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
            const refRect = this.trigger.getBoundingClientRect();
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
