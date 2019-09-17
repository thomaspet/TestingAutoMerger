import {Component, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '../notification-service';
import {Notification} from '@uni-entities';
import {AuthService} from '@app/authService';
import {CompanyService} from '@app/services/services';
import {ToastService} from '@uni-framework/uniToast/toastService';
import { ChatBoxService } from '../../chat-box/chat-box.service';

interface NotificationTypeFilter {
    label: string;
    icon?: string;
    entityType?: string;
}

@Component({
    selector: 'notifications-dropdown',
    templateUrl: './notifications-dropdown.html',
    styleUrls: ['./notifications-dropdown.sass'],
    host: {'class': 'uni-redesign'}
})
export class NotificationsDropdown {
    close: EventEmitter<any> = new EventEmitter();

    typeFilters: NotificationTypeFilter[] = [
        {
            label: 'Alle varsler',
        },
        {
            icon: 'assignment_turned_in',
            label: 'Godkjenninger',
            entityType: 'Approval'
        },
        {
            icon: 'description',
            label: 'Fakturainnboks',
            entityType: 'File'
        },
        {
            icon: 'comment',
            label: 'Kommentarer',
            entityType: 'Comment'
        },
        {
            icon: 'reminder',
            label: 'Påminnelser',
            entityType: 'CustomerInvoiceReminder'
        }
    ];

    currentCompanyOnly: boolean = true;
    selectedFilter: NotificationTypeFilter = this.typeFilters[0];

    items: any[];

    constructor(
        public authService: AuthService,
        public notificationService: NotificationService,
    ) {
        try {
            this.currentCompanyOnly = JSON.parse(sessionStorage.getItem('notifications_current_company_only'));
            const filterEntity = sessionStorage.getItem('notifications_filter_entity');
            this.selectedFilter = filterEntity && this.typeFilters.find(f => f.entityType === filterEntity);
        } catch (e) {}

        if (!this.selectedFilter) {
            this.selectedFilter = this.typeFilters[0];
        }

        this.notificationService.unreadCount$.next(0);

        this.getNotifications();
    }

    getNotifications() {

        const filters = [];

        if (this.currentCompanyOnly) {
            filters.push(`CompanyKey eq '${this.authService.getCompanyKey()}'`);
        }

        if (this.selectedFilter.entityType) {
            const filterField = this.selectedFilter.entityType === 'Approval'
                ? 'EntityType' : 'SourceEntityType';

            filters.push(`${filterField} eq '${this.selectedFilter.entityType}'`);
        }

        const filterString = '' + filters.join(' and ' );
        this.notificationService.getNotifications(filterString).subscribe(
            res => {
                const unread = res.filter(notification => notification['_unread']);
                const read = res.filter(notification => !notification['_unread']);

                const items = [];
                if (unread.length) {
                    items.push({isHeader: true, label: 'Nye'});
                    items.push(...unread);
                }

                if (read.length) {
                    items.push({isHeader: true, label: 'Gamle'});
                    items.push(...read);
                }

                this.items = items;
            },
            err => console.error(err)
        );
    }

    toggleCurrentCompanyOnly() {
        this.currentCompanyOnly = !this.currentCompanyOnly;
        this.saveFilters();
        this.getNotifications();
    }

    onTypeFilterSelected(filter: NotificationTypeFilter) {
        if (this.selectedFilter !== filter) {
            this.selectedFilter = filter;
            this.saveFilters();
            this.getNotifications();
        }
    }

    private saveFilters() {
        sessionStorage.setItem('notifications_current_company_only', JSON.stringify(this.currentCompanyOnly));
        if (this.selectedFilter.entityType) {
            sessionStorage.setItem('notifications_filter_entity', this.selectedFilter.entityType);
        } else {
            sessionStorage.removeItem('notifications_filter_entity');
        }
    }

    onNotificationClick(notification: Notification) {
        this.close.emit();
        this.notificationService.onNotificationClick(notification);
    }

}
