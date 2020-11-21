import {NgModule} from '@angular/core';
import {ContextMenu} from './contextMenu/contextMenu';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AltinnAuthenticationModal} from './modals/AltinnAuthenticationModal';

// REVISIT: toolbar should be a module (maybe even in framework?)
import {UniBreadcrumbs} from './toolbar/breadcrumbs';
import {StatusTrack} from './toolbar/statustrack/statustrack';
import {StatustrackStatus} from './toolbar/statustrack/statustrack-status/statustrack-status';
import {UniTags} from './toolbar/tags';
import {UniToolbar} from './toolbar/toolbar';
import {UniToolbarSearch} from './toolbar/toolbarSearch';
import {UniToolbarValidation} from './toolbar/toolbar-validation/toolbar-validation';
import {ToolbarSharingStatus} from './toolbar/sharing-status/sharing-status';
import {ToolbarCustomStatus} from './toolbar/custom-status/custom-status';
import {ToolbarMonthSelector} from './toolbar/month-selector/month-selector';
import {ToolbarInfoBanner} from './toolbar/Info-banner/info-banner';
import {UniDimensionTOFView} from './dimensions/dimensionForm';
import {UniQueryReadOnly} from './uniQuery/UniQueryReadOnly';
import {UniSummary} from './summary/summary';
import {ImageModal} from './modals/ImageModal';
import {UniAttachments} from './attacments/uniAttachements';
import {LedgerAccountReconciliation} from './reconciliation/ledgeraccounts/ledgeraccountreconciliation';
import {UniAutomarkModal} from './reconciliation/ledgeraccounts/uniAutomarkModal';
import {UniMarkingDetailsModal} from './reconciliation/ledgeraccounts/markingDetails';
import {AccrualModal} from './modals/accrualModal';
import {UniReminderSettingsModal} from './reminder/settings/reminderSettingsModal';
import {ReminderSettings} from './reminder/settings/reminderSettings';
import {ReminderRules} from './reminder/settings/reminderRules';
import {ContactDetails} from './contact/contactDetails';
import {Contacts} from './contact/contacts';
import {AddPaymentModal} from './modals/addPaymentModal';
import {RegisterCustomerClaimPaymentModal} from './modals/RegisterCustomerClaimPaymentModal';
import {ModelTreeView} from './modeltreeview/modeltreeview';
import {ModelTreeRelationNode} from './modeltreeview/relationNode';
import {IsoTimePipe, HoursPipe, NumberPipe} from './utils/pipes';
import {MinutesToHoursPipe} from './utils/pipes';
import {WorkTypeSystemTypePipe} from './utils/pipes';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';
import {QueryBuilder} from './query-builder/query-builder';
import {QueryBuilderItem} from './query-builder/query-item';
import {LinkMenu} from './linkMenu/linkMenu';
import {BookPaymentManualModal} from './modals/bookPaymentManual';
import {VacationPaySettingsModal} from './modals/vacationpay/vacationPaySettingsModal';
import {ConfirmCreditedJournalEntryWithDate} from './modals/confirmCreditedJournalEntryWithDate';
import {ApiKeyComponent} from './apikey/apikeys';
import {ApikeyLineModal} from './apikey/modals/apikey-modal';
import {
    WorkEditor,
    UniTimeModal,
    WorkitemTransferWizard,
    WorkitemTransferWizardFilter,
    WorkitemTransferWizardPreview,
    WorkitemTransferWizardProducts,
    InvoiceHours
} from './timetrackingCommon';

import {JournalingRulesModal} from './modals/journaling-rules-modal/journaling-rules-modal';
import {BankInitModal} from './modals/bank-init-modal/bank-init-modal';
import {VacationPayModal} from './modals/vacationpay/vacationPayModal';

import {UniNewCompanyModal, NEW_COMPANY_VIEWS} from './modals/company-modals/new-company-modal';
import {TaskModal} from '../common/modals/task-modal/task-modal';
import {GrantAccessModal, GRANT_ACCESS_VIEWS} from './modals/company-modals/grant-access-modal';
import {GrantSelfAccessModal} from './modals/company-modals/grant-self-access-modal/grant-self-access-modal';
import {ImportCentralTemplateModal} from './modals/import-central-modal/import-central-template-modal';
import {DisclaimerModal} from '../import-central/modals/disclaimer/disclaimer-modal';
import {ImportTemplateModal} from '../import-central/modals/import-template/import-template-modal';
import {SelectDistributionPlanModal} from './modals/select-distribution-plan-modal/select-distribution-plan-modal';
import {ImportVoucherModal} from '../import-central/modals/custom-component-modals/imports/voucher/import-voucher-modal';
import {ImportOrderModal} from '../import-central/modals/custom-component-modals/imports/order/import-order-modal';
import {EditSubEntityAgaZoneModal} from './modals/editSubEntityAgaZoneModal/editSubEntityAgaZoneModal';
import {LibraryImportsModule} from '@app/library-imports.module';
import {ContractTypeCard} from './contract-type-card/contract-type-card';
import {ContractActivationWizard} from './contract-activation-wizard/contract-activation-wizard';
import {CompanyCreationWizard} from './company-creation-wizard/company-creation-wizard';
import {ContractTypesComparison} from './contract-types-comparison/contract-types-comparison';

import {RegisterAssetModal} from '@app/components/common/modals/register-asset-modal/register-asset-modal';
import {StandardVacationPayModalComponent} from './modals/standard-vacation-pay-modal/standard-vacation-pay-modal.component';
import {DashboardModule} from './dashboard/dashboard.module';
import {CompanyBankAccountModal} from './modals/bank-account-modal/company-bank-account-modal';
import {CompanyBankAccountEdit} from './modals/bank-account-modal/bank-account-edit';
import {BankIDPaymentModal} from './modals/bankid-payment-modal/bankid-payment-modal';
import { CustomerEditModal } from './modals/customer-edit-modal/customer-edit-modal';
import { SupplierEditModal } from './modals/edit-supplier-modal/edit-supplier-modal';

@NgModule({
    imports: [
        LibraryImportsModule,
        UniFrameworkModule,
        DashboardModule
    ],
    declarations: [
        PredefinedDescriptionList,
        ContextMenu,
        AccrualModal,
        AltinnAuthenticationModal,
        ConfirmCreditedJournalEntryWithDate,
        UniBreadcrumbs,
        StatusTrack,
        StatustrackStatus,
        UniToolbar,
        UniToolbarSearch,
        UniToolbarValidation,
        ToolbarSharingStatus,
        ToolbarCustomStatus,
        ToolbarMonthSelector,
        ToolbarInfoBanner,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniTags,
        AddPaymentModal,
        RegisterCustomerClaimPaymentModal,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,
        UniAutomarkModal,
        UniMarkingDetailsModal,
        UniDimensionTOFView,
        ReminderSettings,
        UniReminderSettingsModal,
        ReminderRules,
        VacationPayModal,
        VacationPaySettingsModal,

        ContactDetails,
        Contacts,

        IsoTimePipe,
        HoursPipe,
        NumberPipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,
        BookPaymentManualModal,
        VacationPaySettingsModal,

        ApiKeyComponent,
        ApikeyLineModal,

        ImportCentralTemplateModal,
        DisclaimerModal,
        ImportTemplateModal,
        ImportVoucherModal,
        ImportOrderModal,
        BankInitModal,

        WorkEditor,
        UniTimeModal,
        WorkitemTransferWizard,
        WorkitemTransferWizardFilter,
        WorkitemTransferWizardPreview,
        WorkitemTransferWizardProducts,
        InvoiceHours,

        UniNewCompanyModal,
        TaskModal,
        JournalingRulesModal,
        SelectDistributionPlanModal,
        GrantAccessModal,
        ...GRANT_ACCESS_VIEWS,
        ...NEW_COMPANY_VIEWS,
        GrantSelfAccessModal,
        EditSubEntityAgaZoneModal,
        ContractTypeCard,
        ContractActivationWizard,
        CompanyCreationWizard,
        ContractTypesComparison,
        RegisterAssetModal,
        StandardVacationPayModalComponent,
        BankIDPaymentModal,
        CustomerEditModal,
        SupplierEditModal,
        QueryBuilder,
        QueryBuilderItem,
        CompanyBankAccountModal,
        CompanyBankAccountEdit,
    ],
    exports: [
        DashboardModule,

        PredefinedDescriptionList,
        ConfirmCreditedJournalEntryWithDate,
        ContextMenu,
        AccrualModal,
        AltinnAuthenticationModal,
        UniBreadcrumbs,
        StatusTrack,
        StatustrackStatus,
        UniToolbar,
        UniToolbarValidation,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniTags,
        AddPaymentModal,
        RegisterCustomerClaimPaymentModal,
        UniDimensionTOFView,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,
        UniAutomarkModal,
        EditSubEntityAgaZoneModal,

        ReminderSettings,
        UniReminderSettingsModal,
        VacationPaySettingsModal,
        TaskModal,

        ContactDetails,
        Contacts,

        IsoTimePipe,
        MinutesToHoursPipe,
        HoursPipe,
        NumberPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,

        ApiKeyComponent,
        ApikeyLineModal,

        WorkEditor,
        UniTimeModal,
        WorkitemTransferWizard,
        WorkitemTransferWizardFilter,
        WorkitemTransferWizardPreview,
        WorkitemTransferWizardProducts,
        InvoiceHours,
        VacationPayModal,
        VacationPaySettingsModal,
        ContractTypeCard,
        ContractActivationWizard,
        CompanyCreationWizard,
        ContractTypesComparison,

        RegisterAssetModal,
        StandardVacationPayModalComponent,
        BankIDPaymentModal,
        CustomerEditModal,
        SupplierEditModal,
        QueryBuilder,
        QueryBuilderItem,
        CompanyBankAccountModal,
        CompanyBankAccountEdit,
    ]
})
export class AppCommonModule {}
