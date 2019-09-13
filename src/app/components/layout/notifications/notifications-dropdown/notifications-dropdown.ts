import {Component, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {NotificationService} from '../notification-service';
import {Notification} from '@uni-entities';
import {AuthService} from '@app/authService';
import {CompanyService} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {
    accountingRouteMap,
    salaryRouteMap,
    salesRouteMap,
    timetrackingRouteMap,
    commonRouteMap
} from '../entity-route-map';

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
        private router: Router,
        private toastService: ToastService,
        private companyService: CompanyService,
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

    public onNotificationClick(notification: Notification): void {
        const notificationRoute = this.getNotificationRoute(notification);
        this.close.emit();

        if (notification.CompanyKey === this.authService.getCompanyKey()) {
            this.router.navigateByUrl(notificationRoute);
            return;
        }

        this.companyService.GetAll().subscribe(
            companies => {
                const company = companies.find(c => c.Key === notification.CompanyKey);
                if (company) {
                    this.authService.setActiveCompany(company, notificationRoute);
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
            route = notification['_count'] == 1
                ? '/accounting/bills/0?fileid=:id'
                : '/accounting/bills?filter=Inbox';
        }

        if (!route) {
            route = '';
        }

        return route.replace(/:id/i, notification.EntityID.toString());
    }
}
