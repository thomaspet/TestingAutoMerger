import {NgModule} from '@angular/core';
import {LibraryImportsModule} from '@app/library-imports.module';

import {NotificationService} from './notification-service';
import {Notifications} from './notifications';
import {NotificationsDropdown} from './notifications-dropdown/notifications-dropdown';
import {NotificationItem} from './notification-item/notification-item';
import {UniFrameworkModule} from '@uni-framework/frameworkModule';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule
    ],
    declarations: [
        Notifications,
        NotificationsDropdown,
        NotificationItem,
    ],
    providers: [NotificationService],
    exports: [Notifications]
})
export class NotificationsModule {}
