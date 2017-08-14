import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {ContextMenu} from './contextMenu/contextMenu';
import {ExternalSearch} from './externalSearch/externalSearch';
import {ProductDetails} from './product/details/productDetails';
import {ProductList} from './product/list/productList';
import {AltinnAuthenticationDataModalContent} from './modals/AltinnAuthenticationDataModal';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AltinnAuthenticationDataModal} from './modals/AltinnAuthenticationDataModal';
import {UniBreadcrumbs} from './toolbar/breadcrumbs';
import {UniStatusTrack} from './toolbar/statustrack';
import {UniTags} from './toolbar/tags';
import {UniToolbar} from './toolbar/toolbar';
import {UniDimensions} from './dimensions/UniDimensions';
import {ProjectList} from './dimensions/project/list/projectList';
import {ProjectDetails} from './dimensions/project/details/projectDetails';
import {DepartmentList} from './dimensions/department/list/departmentList';
import {DepartmentDetails} from './dimensions/department/details/departmentDetails';
import {UniQueryReadOnly} from './uniQuery/UniQueryReadOnly';
import {SendEmailForm, SendEmailModal} from './modals/sendEmailModal';
import {UniSummary} from './summary/summary';
import {ImageModal, ImageModalContent} from './modals/ImageModal';
import {UniAttachments} from './attacments/uniAttachements';
import {UniUploadFileButton} from './attacments/uploadFileButton';
import {UniPoster, TextWidget, ContactWidget, TableWidget, AlertsWidget, ImageWidget} from './poster/poster';
import {ActivateAPForm, ActivateAPModal} from './modals/activateAPModal';
import {LedgerAccountReconciliation} from './reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {AccrualForm} from './modals/accrualModal';
import {AccrualModal} from './modals/accrualModal';
import {ReminderSettingsModal, ReminderSettingsForm} from './reminder/settings/settingsModal';
import {ReminderSettings} from './reminder/settings/reminderSettings';
import {ReminderRules} from './reminder/settings/reminderRules';
import {ContactDetails} from './contact/contactDetails';
import {Contacts} from './contact/contacts';
import {AddPaymentModal, AddPaymentForm} from './modals/addPaymentModal';
import {ModelTreeView} from './modeltreeview/modeltreeview';
import {ModelTreeRelationNode} from './modeltreeview/relationNode';
import {SupplierDetailsModal} from './supplier/details/supplierDetailModal';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';
import {Editable} from './utils/editable/editable';
import {IsoTimePipe, HoursPipe} from './utils/pipes';
import {MinutesToHoursPipe} from './utils/pipes';
import {WorkTypeSystemTypePipe} from './utils/pipes';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';
import {LinkMenu} from './linkMenu/linkMenu';
import {SellerList} from './seller/sellerList';
import {SellerLinks} from './seller/sellerLinks';
import {SellerDetails} from './seller/sellerDetails';

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
        UniDimensions,
        ProjectList,
        ProjectDetails,
        PredefinedDescriptionList,
        DepartmentList,
        DepartmentDetails,
        ContextMenu,
        ExternalSearch,
        ProductDetails,
        ProductList,
        AccrualForm,
        AccrualModal,
        AltinnAuthenticationDataModalContent,
        AltinnAuthenticationDataModal,
        UniBreadcrumbs,
        UniStatusTrack.StatusTrack,
        UniToolbar,
        UniQueryReadOnly,
        SendEmailForm,
        SendEmailModal,
        UniSummary,
        ImageModal,
        ImageModalContent,
        UniAttachments,
        UniPoster,
        TextWidget,
        ContactWidget,
        TableWidget,
        AlertsWidget,
        ImageWidget,
        UniUploadFileButton,
        ActivateAPForm,
        ActivateAPModal,
        UniTags,
        AddPaymentModal,
        AddPaymentForm,
        ModelTreeView,
        ModelTreeRelationNode,

        SupplierList,
        SupplierDetails,
        SupplierDetailsModal,

        // reconciliation
        LedgerAccountReconciliation,

        ReminderSettings,
        ReminderSettingsModal,
        ReminderSettingsForm,
        ReminderRules,

        ContactDetails,
        Contacts,

        Editable,
        IsoTimePipe,
        HoursPipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,

        SellerList,
        SellerLinks,
        SellerDetails
    ],
    entryComponents: [
        AccrualForm,
        AltinnAuthenticationDataModalContent,
        SendEmailForm,
        SendEmailModal,
        ImageModalContent,
        ActivateAPForm,
        ActivateAPModal,
        ReminderSettingsForm,
        ReminderSettingsModal,
        ReminderSettings,
        AddPaymentForm
    ],
    exports: [
        UniDimensions,
        ProjectList,
        ProjectDetails,
        PredefinedDescriptionList,
        DepartmentList,
        DepartmentDetails,
        ContextMenu,
        ExternalSearch,
        ProductDetails,
        ProductList,
        AccrualForm,
        AccrualModal,
        AltinnAuthenticationDataModalContent,
        AltinnAuthenticationDataModal,
        UniBreadcrumbs,
        UniStatusTrack.StatusTrack,
        UniToolbar,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        ImageModalContent,
        UniAttachments,
        SendEmailForm,
        SendEmailModal,
        UniPoster,
        TextWidget,
        ContactWidget,
        TableWidget,
        AlertsWidget,
        ImageWidget,
        UniUploadFileButton,
        ActivateAPForm,
        ActivateAPModal,
        UniTags,
        AddPaymentModal,
        AddPaymentForm,
        ModelTreeView,
        ModelTreeRelationNode,

        SupplierList,
        SupplierDetails,
        SupplierDetailsModal,

        // reconciliation
        LedgerAccountReconciliation,

        ReminderSettings,
        ReminderSettingsModal,

        ContactDetails,
        Contacts,

        Editable,
        IsoTimePipe,
        MinutesToHoursPipe,
        HoursPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,

        SellerList,
        SellerLinks,
        SellerDetails
    ]
})
export class AppCommonModule {
}
