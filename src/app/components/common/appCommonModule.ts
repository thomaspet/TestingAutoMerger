import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {ContextMenu} from './contextMenu/contextMenu';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {AltinnAuthenticationModal} from './modals/AltinnAuthenticationModal';

// REVISIT: toolbar should be a module (maybe even in framework?)
import {UniBreadcrumbs} from './toolbar/breadcrumbs';
import {StatusTrack} from './toolbar/statustrack';
import {UniTags} from './toolbar/tags';
import {UniToolbar} from './toolbar/toolbar';
import {UniToolbarShare} from './toolbar/share';
import {UniToolbarSearch} from './toolbar/toolbarSearch';
import {UniToolbarValidation} from './toolbar/toolbar-validation/toolbar-validation';
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
import {ModelTreeView} from './modeltreeview/modeltreeview';
import {ModelTreeRelationNode} from './modeltreeview/relationNode';
import {IsoTimePipe, HoursPipe, NumberPipe} from './utils/pipes';
import {MinutesToHoursPipe} from './utils/pipes';
import {WorkTypeSystemTypePipe} from './utils/pipes';
import {PredefinedDescriptionList} from './predefinedDescriptions/predefinedDescriptionList';
import {LinkMenu} from './linkMenu/linkMenu';
import {BrowserWarning} from './browserWarning/browserWarning';
import {BookPaymentManualModal} from './modals/bookPaymentManual';
import {VacationPaySettingsModal} from '../salary/payrollrun/modals/vacationpay/vacationPaySettingsModal';
import {ApiKeyComponent} from './apikey/apikeys';
import {ApikeyLine} from './apikey/apikeyLine';
import {ApikeyLineModal} from './apikey/modals/apikey-modal';
import {AppPipesModule} from '@app/pipes/appPipesModule';
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

import {
    MatProgressBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatRadioModule
} from '@angular/material';

import {GrantAccessModal, GRANT_ACCESS_VIEWS} from './modals/company-modals/grant-access-modal';
import {UniNewCompanyModal, NEW_COMPANY_VIEWS} from './modals/company-modals/new-company-modal';
import { ImportCentralTemplateModal } from './modals/import-central-modal/import-central-template-modal';
import { DisclaimerModal } from '../import-central/modals/disclaimer/disclaimer-modal';
import { ImportTemplateModal } from '../import-central/modals/import-template/import-template-modal';
import {SelectDistributionPlanModal} from './modals/select-distribution-plan-modal/select-distribution-plan-modal';
import { ImportVoucherModal } from '../import-central/modals/custom-component-modals/imports/voucher/import-voucher-modal';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule,
        UniFrameworkModule,
        AppPipesModule,

        MatProgressBarModule,
        MatMenuModule,
        MatCheckboxModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatRadioModule
    ],
    declarations: [
        PredefinedDescriptionList,
        ContextMenu,
        AccrualModal,
        AltinnAuthenticationModal,
        UniBreadcrumbs,
        StatusTrack,
        UniToolbar,
        UniToolbarShare,
        UniToolbarSearch,
        UniToolbarValidation,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniTags,
        AddPaymentModal,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,
        UniAutomarkModal,
        UniMarkingDetailsModal,
        UniDimensionTOFView,
        ReminderSettings,
        UniReminderSettingsModal,
        ReminderRules,

        ContactDetails,
        Contacts,

        IsoTimePipe,
        HoursPipe,
        NumberPipe,
        MinutesToHoursPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,
        BrowserWarning,
        BookPaymentManualModal,
        VacationPaySettingsModal,

        ApiKeyComponent,
        ApikeyLine,
        ApikeyLineModal,

        ImportCentralTemplateModal,
        DisclaimerModal,
        ImportTemplateModal,
        ImportVoucherModal,

        WorkEditor,
        UniTimeModal,
        WorkitemTransferWizard,
        WorkitemTransferWizardFilter,
        WorkitemTransferWizardPreview,
        WorkitemTransferWizardProducts,
        InvoiceHours,

        UniNewCompanyModal,
        JournalingRulesModal,
        SelectDistributionPlanModal,
        ...NEW_COMPANY_VIEWS,
        GrantAccessModal,
        ...GRANT_ACCESS_VIEWS,
    ],
    entryComponents: [
        AltinnAuthenticationModal,
        UniReminderSettingsModal,
        ReminderSettings,
        AddPaymentModal,
        AccrualModal,
        ImageModal,
        BookPaymentManualModal,
        VacationPaySettingsModal,
        ApikeyLineModal,
        UniAutomarkModal,
        UniTimeModal,
        UniMarkingDetailsModal,
        WorkitemTransferWizard,
        GrantAccessModal,
        UniNewCompanyModal,
        ImportCentralTemplateModal,
        JournalingRulesModal,
        SelectDistributionPlanModal,
        DisclaimerModal,
        ImportTemplateModal,
        ImportVoucherModal,
        JournalingRulesModal
    ],
    exports: [
        PredefinedDescriptionList,
        ContextMenu,
        AccrualModal,
        AltinnAuthenticationModal,
        UniBreadcrumbs,
        StatusTrack,
        UniToolbar,
        UniQueryReadOnly,
        UniSummary,
        ImageModal,
        UniAttachments,
        UniTags,
        AddPaymentModal,
        UniDimensionTOFView,
        ModelTreeView,
        ModelTreeRelationNode,
        LedgerAccountReconciliation,
        UniAutomarkModal,

        ReminderSettings,
        UniReminderSettingsModal,
        VacationPaySettingsModal,

        ContactDetails,
        Contacts,

        IsoTimePipe,
        MinutesToHoursPipe,
        HoursPipe,
        NumberPipe,
        WorkTypeSystemTypePipe,

        LinkMenu,

        BrowserWarning,

        ApiKeyComponent,
        ApikeyLine,
        ApikeyLineModal,

        WorkEditor,
        UniTimeModal,
        WorkitemTransferWizard,
        WorkitemTransferWizardFilter,
        WorkitemTransferWizardPreview,
        WorkitemTransferWizardProducts,
        InvoiceHours,
    ]
})
export class AppCommonModule {}
