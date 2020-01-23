import {Component, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {take} from 'rxjs/operators';

import {NotificationService} from './notification-service';
import {NotificationsDropdown} from './notifications-dropdown/notifications-dropdown';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {SignalRService} from '@app/services/common/signal-r.service';
import {AuthService} from '@app/authService';
import {CompanyService} from '@app/services/services';
import {ChatBoxService} from '../chat-box/chat-box.service';
import {UniIcon} from '@uni-framework/ui/icon/uni-icon';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.html',
    styleUrls: ['./notifications.sass']
})
export class Notifications {
    @ViewChild(UniIcon, { static: true }) toggleRef: UniIcon;

    overlayRef: OverlayRef;
    dropdownPortal: ComponentPortal<NotificationsDropdown>;
    _lastRoleRefresh: number;

    constructor(
        private overlay: Overlay,
        private cdr: ChangeDetectorRef,
        public notificationService: NotificationService,
        public signalRService: SignalRService,
        private toastService: ToastService,
        private authService: AuthService,
        private router: Router,
        private companyService: CompanyService,
        private chatBoxService: ChatBoxService,
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
                if (message.cargo && message.cargo.sourceEntityType === 'Comment') {
                    this.handleCommentNotification(message.cargo);
                } else {
                    const entityType = message.cargo && message.cargo.entityType;
                    switch (entityType) {
                        case 'Approval':
                            this.handleApprovalNotification(message.cargo);
                        break;
                        case 'UserRole':
                            this.handleUserRoleNotificiation(message.cargo);
                        break;
                        case 'BatchInvoice':
                            this.handleBatchInvoiceNotification(message.cargo);
                        break;
                    }
                }

                this.cdr.markForCheck();
            }
        });

        const position = this.overlay.position().connectedTo(
            this.toggleRef.elementRef.nativeElement,
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

    private handleCommentNotification(body) {
        // Chat boxes across companies doesn't work very well. Ignoring these for now.
        if (body.companyKey !== this.authService.activeCompany.Key) {
            return;
        }

        // Mostly copy paste from notification-service. ChatBoxService should probably handle this..
        const businessObject = {
            EntityID: body.entityID,
            EntityType: body.entityType,
            CompanyKey: body.companyKey,
        };

        const chatboxObjects = this.chatBoxService.businessObjects.value;
        const chatBoxExists = chatboxObjects.find(object => {
            return object.EntityID === businessObject.EntityID
                && object.EntityType.toLowerCase() === businessObject.EntityType.toLowerCase();
        });

        if (!chatBoxExists) {
            chatboxObjects.push(businessObject);
            this.chatBoxService.businessObjects.next(chatboxObjects);
        }
    }

    private handleUserRoleNotificiation(body) {
        if (this._lastRoleRefresh && (new Date().getTime() - this._lastRoleRefresh) < 3000) {
            return;
        }

        this._lastRoleRefresh = new Date().getTime();

        this.toastService.toast({
            title: `Tilgangsnivået ditt har blitt endret av ${body.senderDisplayName}`,
            message: 'De nye tilgangene blir tilgjengelig neste gang applikasjonen laster',
            type: ToastType.info,
            duration: 0,
            action: {
                label: 'Last på nytt nå',
                click: () => window.location.reload()
            }
        });
    }

    private handleApprovalNotification(body) {
        this.companyService.GetAll().subscribe(
            companies => {
                const company = (companies || []).find(c => c.Key === body.companyKey);
                if (!company) {
                    return;
                }

                let url = `/assignments/approvals?id=${body.sourceEntityID}`;
                let message = body.message;
                let entityLabel = body.sourceEntityType;

                if (body.sourceEntityType === 'SupplierInvoice') {
                    entityLabel = 'leverandørfaktura';
                    message = `Faktura: ${body.message}`;
                    const route = `/accounting/bills/${body.sourceEntityID}`;
                    if (this.authService.canActivateRoute(this.authService.currentUser, route)) {
                        url = route;
                    }
                } else if (body.sourceEntityType === 'WorkItemGroup') {
                    entityLabel = 'timeliste';
                }

                let header = `${body.senderDisplayName} har spurt deg om godkjenning`;
                let action;
                let toastType;

                if (body.message.includes('Rejected')) {
                    header = `${body.senderDisplayName} har avvist en ${entityLabel}`;
                    toastType = ToastType.warn;
                } else if (body.message.includes('Approved')) {
                    header = `${body.senderDisplayName} har godkjent en ${entityLabel}`;
                } else {
                    action = {
                        label: 'Gå til godkjenning',
                        click: () => {
                            const companyKey = body.companyKey;
                            const activeCompanyKey = this.authService.getCompanyKey();
                            if (companyKey === activeCompanyKey) {
                                this.router.navigateByUrl(url);
                            } else {
                                this.authService.setActiveCompany(company, url);
                            }
                        }
                    };
                }

                this.toastService.toast({
                    title: header,
                    message: `Selskap: ${body.companyName}<br>${message}`,
                    type: toastType || ToastType.info,
                    duration: 10,
                    action: action
                });
            },
            () => {/* Fail silently */}
        );
    }

    private handleBatchInvoiceNotification(body) {
        const messageSplit = body.message && body.message.split('\n');
        if (messageSplit && messageSplit.length) {
            this.toastService.toast({
                title: messageSplit[0],
                message: messageSplit.slice(1).join('<br>'),
                type: ToastType.info,
                duration: 10
            });
        }
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
