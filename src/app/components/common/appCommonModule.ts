import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {ContextMenu} from './contextMenu/contextMenu';
import {ExternalSearch} from './externalSearch/externalSearch';
import {UniFeedback} from './feedback/feedback';
import {ProductDetails} from './product/details/productDetails';
import {ProductList} from './product/list/productList';
import {AddressForm} from './modals/addressModal';
import {AltinnAuthenticationDataModalContent} from './modals/AltinnAuthenticationDataModal';
import {BankAccountForm} from './modals/bankAccountModal';
import {EmailForm, EmailModal} from './modals/emailModal';
import {PhoneForm, PhoneModal} from './modals/phoneModal';
import {RegisterPaymentForm} from './modals/registerPaymentModal';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AddressModal} from './modals/addressModal';
import {AltinnAuthenticationDataModal} from './modals/AltinnAuthenticationDataModal';
import {BankAccountModal} from './modals/bankAccountModal';
import {RegisterPaymentModal} from './modals/registerPaymentModal';
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
import {ReminderRuleDetails} from './reminder/settings/ruleDetails';
import {AddPaymentModal, AddPaymentForm} from './modals/addPaymentModal';
import {ModelTreeView} from './modeltreeview/modeltreeview';
import {ModelTreeRelationNode} from './modeltreeview/relationNode';
import {SupplierDetailsModal} from './supplier/details/supplierDetailModal';
import {SupplierDetails} from './supplier/details/supplierDetails';
import {SupplierList} from './supplier/list/supplierList';

import {routes as AppCommonRoutes} from './appCommonRoutes';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        RouterModule,
        UniFrameworkModule,
        UniTableModule,
        AppCommonRoutes,
        UniFormModule
    ],
    declarations: [
        UniDimensions,
        ProjectList,
        ProjectDetails,
        DepartmentList,
        DepartmentDetails,
        ContextMenu,
        ExternalSearch,
        UniFeedback,
        ProductDetails,
        ProductList,
        AddressForm,
        AddressModal,
        AccrualForm,
        AccrualModal,
        AltinnAuthenticationDataModalContent,
        AltinnAuthenticationDataModal,
        BankAccountForm,
        BankAccountModal,
        EmailForm,
        EmailModal,
        PhoneForm,
        PhoneModal,
        RegisterPaymentForm,
        RegisterPaymentModal,
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
        ReminderRuleDetails
    ],
    entryComponents: [
        AddressForm,
        AccrualForm,
        BankAccountForm,
        EmailForm,
        PhoneForm,
        RegisterPaymentForm,
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
        DepartmentList,
        DepartmentDetails,
        ContextMenu,
        ExternalSearch,
        UniFeedback,
        ProductDetails,
        ProductList,
        AddressForm,
        AddressModal,
        AccrualForm,
        AccrualModal,
        AltinnAuthenticationDataModalContent,
        AltinnAuthenticationDataModal,
        BankAccountForm,
        BankAccountModal,
        EmailForm,
        EmailModal,
        PhoneForm,
        PhoneModal,
        RegisterPaymentForm,
        RegisterPaymentModal,
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
        ReminderSettingsModal
    ]
})
export class AppCommonModule {
}
