import {UniConfirmModalV2} from './modals/confirmModal';
import {UniConfirmModalWithList} from './modals/confirmModalWithList';
import {UniAddressModal} from './modals/addressModal';
import {UniPhoneModal} from './modals/phoneModal';
import {UniEmailModal} from './modals/emailModal';
import {UniSendEmailModal} from './modals/sendEmailModal';
import {UniSendPaymentModal} from './modals/sendPaymentModal';
import {UniBankAccountModal} from './modals/bankAccountModal';
import {UniUnsavedChangesModal} from './modals/unsavedChangesModal';
import {UniRegisterPaymentModal} from './modals/registerPaymentModal';
import {UniActivateAPModal} from './modals/activateAPModal/activateAPModal';
import {UniActivateEInvoiceModal} from './modals/activateEInvoiceModal';
import {UniActivateInvoicePrintModal} from './modals/activateInvoicePrintModal';
import {ActivateOCRModal} from './modals/activateOcrModal';
import {UniDownloadPaymentsModal} from './modals/downloadPaymentsModal';
import {SingleTextFieldModal} from './modals/singleTextFieldModal';
import {UserLicenseAgreementModal} from './modals/userLicenseAgreementModal';
import {UniBrRegModal} from './modals/brRegModal/brRegModal';
import {UniBankModal} from './modals/bankModal';
import {UniChooseReportModal} from './modals/choose-report-modal/chooseReportModal';
import {SubCompanyModal} from './modals/subCompanyModal';
import {UniEditFieldModal} from './modals/editFieldModal';
import {ProductPurchasesModal} from './modals/product-purchases-modal/product-purchases-modal';
import {MissingPurchasePermissionModal} from './modals/missing-purchase-permission/missing-purchase-permission';
import {UniAutobankAgreementModal} from './modals/autobankAgreementModal';
import {UniFileUploadModal} from './modals/uploadFilesModal';
import {CompanyActionsModal} from './modals/company-actions-modal/company-actions-modal';
import {UniReinvoiceModal} from './modals/reInvoiceModal/reinvoiceModal';
import {UniCompanyAccountingSettingsModal} from './modals/companyAccountingSettingsModal/companyAccountingSettingsModal';
import {UniConfirmModalWithCheckbox} from './modals/confirmWithCheckboxModal';
import {UniMandatoryDimensionsModal} from './modals/mandatoryDimensionsModal/mandatoryDimensionsModal';
import {LicenseAgreementModal} from './modals/license-agreement-modal/license-agreement-modal';
import {InvoiceApprovalModal} from './modals/invoice-approval-modal/invoice-approval-modal';
import {WizardSettingsModal} from './modals/wizard-settings-modal/wizard-settings-modal';
import { BarnepassProductsModal } from '@app/components/sales/altinn/barnepass/barnepassProductsModal';

export * from './modalService';
export * from './interfaces';
export * from './modals/confirmModal';
export * from './modals/confirmModalWithList';
export * from './modals/addressModal';
export * from './modals/phoneModal';
export * from './modals/emailModal';
export * from './modals/sendEmailModal';
export * from './modals/sendPaymentModal';
export * from './modals/bankAccountModal';
export * from './modals/unsavedChangesModal';
export * from './modals/registerPaymentModal';
export * from './modals/activateAPModal/activateAPModal';
export * from './modals/activateEInvoiceModal';
export * from './modals/activateOcrModal';
export * from './modals/activateInvoicePrintModal';
export * from './modals/downloadPaymentsModal';
export * from './modals/singleTextFieldModal';
export * from './modals/userLicenseAgreementModal';
export * from './modals/brRegModal/brRegModal';
export * from './modals/bankModal';
export * from './modals/choose-report-modal/chooseReportModal';
export * from './modals/editFieldModal';
export * from './modals/product-purchases-modal/product-purchases-modal';
export * from './modals/missing-purchase-permission/missing-purchase-permission';
export * from './modals/autobankAgreementModal';
export * from './modals/uploadFilesModal';
export * from './modals/company-actions-modal/company-actions-modal';
export * from './modals/reInvoiceModal/reinvoiceModal';
export * from './modals/companyAccountingSettingsModal/companyAccountingSettingsModal';
export * from './modals/confirmWithCheckboxModal';
export * from './modals/reInvoiceModal/showReinvoiceStatus.pipe';
export * from './modals/mandatoryDimensionsModal/mandatoryDimensionsModal';
export * from './modals/license-agreement-modal/license-agreement-modal';
export * from './modals/invoice-approval-modal/invoice-approval-modal';
export * from './modals/wizard-settings-modal/wizard-settings-modal';

export const MODALS = [
    UniConfirmModalV2,
    UniConfirmModalWithList,
    UniAddressModal,
    UniPhoneModal,
    UniEmailModal,
    UniSendEmailModal,
    UniSendPaymentModal,
    UniBankAccountModal,
    UniUnsavedChangesModal,
    UniRegisterPaymentModal,
    UniActivateAPModal,
    UniActivateEInvoiceModal,
    ActivateOCRModal,
    UniActivateInvoicePrintModal,
    UniDownloadPaymentsModal,
    SingleTextFieldModal,
    UserLicenseAgreementModal,
    UniBrRegModal,
    UniBankModal,
    UniChooseReportModal,
    SubCompanyModal,
    UniEditFieldModal,
    ProductPurchasesModal,
    UniAutobankAgreementModal,
    UniFileUploadModal,
    CompanyActionsModal,
    MissingPurchasePermissionModal,
    UniReinvoiceModal,
    UniCompanyAccountingSettingsModal,
    UniConfirmModalWithCheckbox,
    UniMandatoryDimensionsModal,
    LicenseAgreementModal,
    InvoiceApprovalModal,
    WizardSettingsModal,
    BarnepassProductsModal
];

