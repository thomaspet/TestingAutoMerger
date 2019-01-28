import {Component, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {take} from 'rxjs/operators';

import {NotificationService} from './notification-service';
import {NotificationsDropdown} from './notifications-dropdown/notifications-dropdown';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.html',
    styleUrls: ['./notifications.sass']
})
export class Notifications {
    @ViewChild('toggleButton') toggleRef: ElementRef;

    overlayRef: OverlayRef;
    dropdownPortal: ComponentPortal<NotificationsDropdown>;

    unreadCount: number;

    constructor(
        private overlay: Overlay,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService
    ) {
        this.notificationService.getNotifications().subscribe(
            notifications => {
                this.unreadCount = notifications.reduce((count, notification) => {
                    if (notification['_unread']) {
                        count++;
                    }

                    return count;
                }, 0);

                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    ngAfterViewInit() {
        this.dropdownPortal = new ComponentPortal(NotificationsDropdown);

        const position = this.overlay.position().connectedTo(
            this.toggleRef,
            {originX: 'end', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'}
        );

        this.overlayRef = this.overlay.create({
            positionStrategy: position,
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            disposeOnNavigation: true
        });

        this.overlayRef.backdropClick().subscribe(() => this.toggle());
    }

    toggle() {
        if (this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
            this.notificationService.markNotificationsRead();
        } else {
            this.unreadCount = 0;
            const componentRef = this.overlayRef.attach(this.dropdownPortal);
            componentRef.instance.close.pipe(
                take(1)
            ).subscribe(() => {
                this.toggle();
            });
        }
    }
}
