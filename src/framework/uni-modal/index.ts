import {UniConfirmModalV2} from './modals/confirmModal';
import {UniConfirmModalWithList} from './modals/confirmModalWithList';
import {UniAddressModal} from './modals/addressModal';
import {UniPhoneModal} from './modals/phoneModal';
import {UniEmailModal} from './modals/emailModal';
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
import {BarnepassProductsModal} from './modals/barnepassModals/barnepassProductsModal';
import {BarnepassSenderModal} from './modals/barnepassModals/barnepassSenderModal';
import {FileSplitModal} from './modals/file-split-modal/file-split-modal';
import {TofEmailModal} from './modals/tof-email-modal/tof-email-modal';
import {PurchaseTraveltextModal} from './modals/purchase-traveltext-modal/purchase-traveltext-modal';
import {UniNewRegulativeModal} from './modals/newRegulativeModal';
import {MissingRolesModal} from './modals/missing-roles-modal/missing-roles-modal';
import {UniTermsModal} from './modals/terms-modal';
import {UniPreviewModal} from './modals/previewModal';
import {FileFromInboxModal} from './modals/file-from-inbox-modal/file-from-inbox-modal';
import {ConfigBankAccountsModal} from './modals/bank-accounts-config-modal/bank-accounts-config-modal';
import {BankInfoModal} from './modals/bank-info-modal/bank-info-modal';
import {GiveSupportAccessModal} from './modals/give-support-access-modal/give-support-access-modal';
import {BrunoBankOnboardingModal} from './modals/bruno-bank-onboarding-modal/bruno-bank-onboarding-modal';
import {BrunoBankOffboardingModal} from './modals/bruno-bank-offboarding-modal/bruno-bank-offboarding-modal';
import {PreapprovedPaymentsModal} from './modals/preapproved-payments-modal/preapproved-payments-modal';


export * from './modalService';
export * from './interfaces';
export * from './modals/confirmModal';
export * from './modals/confirmModalWithList';
export * from './modals/addressModal';
export * from './modals/phoneModal';
export * from './modals/emailModal';
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
export * from './modals/file-split-modal/file-split-modal';
export * from './modals/tof-email-modal/tof-email-modal';
export * from './modals/purchase-traveltext-modal/purchase-traveltext-modal';
export * from './modals/newRegulativeModal';
export * from './modals/missing-roles-modal/missing-roles-modal';
export * from './modals/terms-modal';
export * from './modals/previewModal';
export * from './modals/file-from-inbox-modal/file-from-inbox-modal';
export * from './modals/bank-accounts-config-modal/bank-accounts-config-modal';
export * from './modals/bank-info-modal/bank-info-modal';
export * from './modals/bruno-bank-onboarding-modal/bruno-bank-onboarding-modal';
export * from './modals/give-support-access-modal/give-support-access-modal';
export * from './modals/preapproved-payments-modal/preapproved-payments-modal';

export const MODALS = [
    UniConfirmModalV2,
    UniConfirmModalWithList,
    UniAddressModal,
    UniPhoneModal,
    UniEmailModal,
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
    BarnepassProductsModal,
    BarnepassSenderModal,
    FileSplitModal,
    TofEmailModal,
    PurchaseTraveltextModal,
    UniNewRegulativeModal,
    MissingRolesModal,
    UniTermsModal,
    UniPreviewModal,
    FileFromInboxModal,
    ConfigBankAccountsModal,
    BankInfoModal,
    GiveSupportAccessModal,
    BrunoBankOnboardingModal,
    BrunoBankOffboardingModal,
    PreapprovedPaymentsModal,
];

