import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Notification} from '@uni-entities';
import {UniHttp} from '@uni-framework/core/http/http';
import {BizHttp} from '@uni-framework/core/http/BizHttp';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import {
    accountingRouteMap,
    salaryRouteMap,
    salesRouteMap,
    timetrackingRouteMap,
    commonRouteMap
} from './entity-route-map';
import { ChatBoxService } from '../chat-box/chat-box.service';
import { AuthService } from '@app/authService';
import { Router } from '@angular/router';
import { CompanyService } from '@app/services/services';
import { BusinessObject } from '@app/models';
import { ToastType, ToastService } from '@uni-framework/uniToast/toastService';
import {environment} from 'src/environments/environment';

@Injectable()
export class NotificationService extends BizHttp<Notification> {
    readTimestamp: Date;

    unreadCount$: BehaviorSubject<number> = new BehaviorSubject(null);
    isSrEnvironment = environment.isSrEnvironment;

    constructor(
        uniHttp: UniHttp,
        private chatBoxService: ChatBoxService,
        private authService: AuthService,
        private router: Router,
        private companyService: CompanyService,
        private toastService: ToastService,
    ) {
        super(uniHttp);
        this.relativeURL = 'notifications';
        this.DefaultOrderBy = 'CreatedAt desc';

        try {
            this.readTimestamp = JSON.parse(localStorage.getItem('notifications_read_timestamp'));
        } catch (e) {}

        if (!this.readTimestamp) {
            this.readTimestamp = new Date();
            localStorage.setItem('notifications_read_timestamp', JSON.stringify(this.readTimestamp));
        }
    }

    markNotificationsRead() {
        this.readTimestamp = new Date();
        localStorage.setItem(
            'notifications_read_timestamp',
            JSON.stringify(this.readTimestamp)
        );
    }

    getNotifications(filter?: string, reducePayload = false) {
        let query = reducePayload ? 'top=1' : 'top=99';
        if (filter) {
            query += '&filter=' + filter;
        }

        return this.GetAll(query).pipe(
            map((notifications: Notification[]) => {
                notifications = notifications.map(notification => this.setNotificationMetadata(notification));
                return this.groupInboxNotifications(notifications);
            })
        );
    }

    onNotificationClick(notification: Notification): void {
        const notificationRoute = this.getNotificationRoute(notification);

        // Check if we're already logged into the company or if we need to change
        if (notification.CompanyKey === this.authService.getCompanyKey()) {
            if (notification.SourceEntityType === 'Comment') {
                this.chatBoxService.addBusinessObject({
                    EntityID: notification.EntityID,
                    EntityType: notification.EntityType,
                    CompanyKey: notification.CompanyKey,
                });
            }

            this.router.navigateByUrl(notificationRoute);
        } else {
            this.companyService.GetAll().subscribe(
                companies => {
                    const company = companies.find(c => c.Key === notification.CompanyKey);
                    if (company) {
                        if (notification.SourceEntityType === 'Comment') {
                            this.chatBoxService.addBusinessObject({
                                EntityType: notification.EntityType,
                                EntityID: notification.EntityID,
                                CompanyKey: notification.CompanyKey,
                            });
                        } else {
                            this.authService.setActiveCompany(company, notificationRoute);
                        }
                    } else {
                        this.toastService.addToast(
                            'Mistet tilgang',
                            ToastType.warn, 10,
                            `Det ser ut som du nå mangler tilgang til ${notification.CompanyName},
                            vennligst kontakt selskapets administrator.`,
                        );
                    }
                },
                err => console.error(err)
            );
        }
    }

    private getNotificationRoute(notification: Notification) {
        const entityType = notification.EntityType.toLowerCase();
        let route = '';

        if (accountingRouteMap[entityType]) {
            route = '/accounting/' + accountingRouteMap[entityType];
        } else if (salesRouteMap[entityType]) {
            route = '/sales/' + salesRouteMap[entityType];
        } else if (salaryRouteMap[entityType]) {
            route = '/salary/' + salaryRouteMap[entityType];
        } else if (timetrackingRouteMap[entityType]) {
            route = '/timetracking/' + timetrackingRouteMap[entityType];
        } else if (commonRouteMap[entityType]) {
            route = commonRouteMap[entityType];
        } else if (notification.EntityType === 'File' && notification.SenderDisplayName === 'Uni Micro AP') {
            route = this.isSrEnvironment ? '/accounting/inbox'
                : notification['_count'] === 1
                ? '/accounting/bills/0?fileid=:id'
                : '/accounting/bills?filter=Inbox';
        }

        if (!route) {
            route = '';
        }

        return route.replace(/:id/i, notification.EntityID.toString());
    }

    private setNotificationMetadata(notification: Notification): Notification {
        const createdAt = moment(notification.CreatedAt);
        if (createdAt.isValid()) {
            notification['_timestamp'] = createdAt.fromNow();

            if (createdAt.isAfter(moment(this.readTimestamp))) {
                notification['_unread'] = true;
            }
        }

        return notification;
    }

    private groupInboxNotifications(notifications: Notification[]): Notification[] {
        const grouped: Notification[] = [];

        notifications.forEach(notification => {
            if (notification.SourceEntityType === 'File') {
                const previousNotificiation = grouped[grouped.length - 1];
                if (previousNotificiation
                    && previousNotificiation.SourceEntityType === 'File'
                    && previousNotificiation.CompanyKey === notification.CompanyKey
                    && previousNotificiation['_timestamp'] === notification['_timestamp']
                ) {
                    previousNotificiation['_count']++;
                } else {
                    notification['_count'] = 1;
                    grouped.push(notification);
                }

            } else {
                grouped.push(notification);
            }
        });

        return grouped;
    }
}
