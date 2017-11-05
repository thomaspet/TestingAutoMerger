import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {ContextMenu} from './contextMenu/contextMenu';
import {ExternalSearch} from './externalSearch/externalSearch';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AltinnAuthenticationModal} from './modals/AltinnAuthenticationModal';
import {UniBreadcrumbs} from './toolbar/breadcrumbs';
import {UniStatusTrack} from './toolbar/statustrack';
import {UniTags} from './toolbar/tags';
import {UniToolbar} from './toolbar/toolbar';
import {UniToolbarHelp} from './toolbar/help';
import {UniToolbarShare} from './toolbar/share';
import {UniToolbarSearch} from './toolbar/toolbarSearch';
import {UniQueryReadOnly} from './uniQuery/UniQueryReadOnly';
import {UniSummary} from './summary/summary';
import {ImageModal} from './modals/ImageModal';
import {UniAttachments} from './attacments/uniAttachements';
import {UniUploadFileButton} from './attacments/uploadFileButton';
import {UniPoster, TextWidget, ContactWidget, TableWidget, AlertsWidget, ImageWidget} from './poster/poster';
import {LedgerAccountReconciliation} from './reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {AccrualModal} from './modals/accrualModal';
import {UniReminderSettingsModal} from './reminder/settings/reminderSettingsModal';
import {ReminderSettings} from './reminder/settings/reminderSettings';
import {ReminderRules} from './reminder/settings/reminderRules';
import {ContactDetails} from './contact/contactDetails';
import {Contacts} from './contact/contacts';
import {AddPaymentModal, AddPaymentForm} from './modals/addPaymentModal';
import {ModelTreeView} from './modeltreeview/modeltreeview';
import {ModelTreeRelationNode} from './modeltreeview/relationNode';
import {Editable} from './utils/editable/editable';
import {IsoTimePipe, HoursPipe, NumberPipe} from './utils/pipes';
import {MinutesToHoursPipe} from './utils/pipes';
import {WorkTypeSystemTypePipe} from './utils/pipes';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';
import {LinkMenu} from './linkMenu/linkMenu';
import {UniInfo} from './uniInfo/uniInfo';
import {BrowserWarning} from './browserWarning/browserWarning';

import {routes as AppCommonRoutes} from './appCommonRoutes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        UniFrameworkModule,
        AppCommonRoutes,
    ],
    declarations: [
        PredefinedDescriptionList,
        ContextMenu,
        ExternalSearch,
        AccrualModal,
        AltinnAuthenticationModal,
        UniBreadcrumbs,
        UniStatusTrack.StatusTrack,
        UniToolbar,
        UniToolbarHelp,
        UniToolbarShare,
        UniToolbarSearch,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniPoster,
        TextWidget,
        ContactWidget,
        TableWidget,
        AlertsWidget,
        ImageWidget,
        UniUploadFileButton,
        UniTags,
        AddPaymentModal,
        AddPaymentForm,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,

        ReminderSettings,
        UniReminderSettingsModal,
        ReminderRules,

        ContactDetails,
        Contacts,

        Editable,
        IsoTimePipe,
        HoursPipe,
        NumberPipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,
        UniInfo,
        BrowserWarning
    ],
    entryComponents: [
        AltinnAuthenticationModal,
        UniReminderSettingsModal,
        ReminderSettings,
        AddPaymentForm,
        AccrualModal,
        ImageModal
    ],
    exports: [
        PredefinedDescriptionList,
        ContextMenu,
        ExternalSearch,
        AccrualModal,
        AltinnAuthenticationModal,
        UniBreadcrumbs,
        UniStatusTrack.StatusTrack,
        UniToolbar,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniPoster,
        TextWidget,
        ContactWidget,
        TableWidget,
        AlertsWidget,
        ImageWidget,
        UniUploadFileButton,
        UniTags,
        AddPaymentModal,
        AddPaymentForm,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,

        ReminderSettings,
        UniReminderSettingsModal,

        ContactDetails,
        Contacts,

        Editable,
        IsoTimePipe,
        MinutesToHoursPipe,
        HoursPipe,
        NumberPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,

        UniInfo,
        BrowserWarning
    ]
})
export class AppCommonModule {}
