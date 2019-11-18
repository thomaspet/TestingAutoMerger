import {Component, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {take} from 'rxjs/operators';

import {NotificationService} from './notification-service';
import {NotificationsDropdown} from './notifications-dropdown/notifications-dropdown';

import { ToastService, ToastType, ToastTime, IToastAction } from '@uni-framework/uniToast/toastService';
import { SignalRService } from '@app/services/common/signal-r.service';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.html',
    styleUrls: ['./notifications.sass']
})
export class Notifications {
    @ViewChild('toggleButton') toggleRef: ElementRef;

    overlayRef: OverlayRef;
    dropdownPortal: ComponentPortal<NotificationsDropdown>;
    _lastRoleRefresh: number;

    constructor(
        private overlay: Overlay,
        private cdr: ChangeDetectorRef,
        public notificationService: NotificationService,
        public signalRService: SignalRService,
        private toastService: ToastService,
    ) {
        this.notificationService.getNotifications().subscribe(
            notifications => {
                this.notificationService.unreadCount$.next(notifications.reduce((count, notification) => {
                    if (notification['_unread']) {
                        count++;
                    }

                    return count;
                }, 0));

                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    ngAfterViewInit() {
        this.dropdownPortal = new ComponentPortal(NotificationsDropdown);

        this.signalRService.pushMessage$.subscribe((message: any) => {
            if (message && message.entityType === 'notification') {
                if (message.cargo && message.cargo.entityType === 'UserRole') {
                    if (this._lastRoleRefresh && (new Date().getTime() - this._lastRoleRefresh) < 3000) {
                        // Ignoring message since we already warned about this..
                        return;
                    }
                    this._lastRoleRefresh = new Date().getTime();
                    this.toastReloadMessage('Trykk oppdater, eller last siden på nytt for oppdatere programmet'
                        + ' slik at det gjenspeiler de nye tilgangene.',
                        `Din brukertilgang har blitt endret av "${message.cargo.senderDisplayName}"`);
                    this.cdr.markForCheck();
                } else {
                    this.loadAndShowUnread();
                }
             }
        });

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

    loadAndShowUnread() {
        this.notificationService.getNotifications('', true).subscribe(
            notifications => {
                notifications.forEach(notification => {
                    if (notification['_unread']) {
                        this.notificationService.unreadCount$.next(this.notificationService.unreadCount$.value + 1);
                        this.toastNotification(notification);
                    }
                });
            });
    }

    toastNotification(notification) {
        if (!notification.Message) { return; }
        this.toastService.addToast(
            notification.SenderDisplayName,
            ToastType.good,
            ToastTime.medium,
            notification.Message,
            <IToastAction>{
                label: 'Åpne',
                click: () => this.notificationService.onNotificationClick(notification)
            }
        );
    }

    toastReloadMessage(msg: string, title: string) {
        this.toastService.addToast(
            title,
            ToastType.bad,
            ToastTime.forever,
            msg,
            <IToastAction>{
                label: 'Oppdater',
                click: () => window.location.reload()
            }
        );
    }

    toggle() {
        if (this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
            this.notificationService.markNotificationsRead();
        } else {
            const componentRef = this.overlayRef.attach(this.dropdownPortal);
            componentRef.instance.close.pipe(
                take(1)
            ).subscribe(() => {
                this.toggle();
            });
        }
    }

}
