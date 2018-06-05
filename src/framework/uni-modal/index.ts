import {UniConfirmModalV2} from './modals/confirmModal';
import {UniConfirmModalWithList} from './modals/confirmModalWithList';
import {UniAddressModal} from './modals/addressModal';
import {UniPhoneModal} from './modals/phoneModal';
import {UniEmailModal} from './modals/emailModal';
import {UniSendEmailModal} from './modals/sendEmailModal';
import {UniSendPaymentModal} from './modals/sendPaymentModal';
import {UniSendVippsInvoiceModal} from './modals/sendVippsInvoiceModal';
import {UniBankAccountModal} from './modals/bankAccountModal';
import {UniUnsavedChangesModal} from './modals/unsavedChangesModal';
import {UniRegisterPaymentModal} from './modals/registerPaymentModal';
import {UniActivateAPModal} from './modals/activateAPModal';
import {UniApproveModal} from './modals/approveModal';
import {UniDownloadPaymentsModal} from './modals/downloadPaymentsModal';
import {SingleTextFieldModal} from './modals/singleTextFieldModal';
import {LicenseAgreementModal} from '@uni-framework/uni-modal/modals/licenseAgreementModal';
import {UniBrRegModal} from './modals/brRegModal/brRegModal';
import {ManageProductsModal} from '@uni-framework/uni-modal/modals/manageProductsModal';
import {UniBankModal} from './modals/bankModal';
import {UniChangelogModal} from './modals/changelog-modal/changelog-modal';
import {SubCompanyModal} from './modals/subCompanyModal';

export * from './modalService';
export * from './interfaces';
export * from './modals/confirmModal';
export * from './modals/confirmModalWithList';
export * from './modals/addressModal';
export * from './modals/phoneModal';
export * from './modals/emailModal';
export * from './modals/sendEmailModal';
export * from './modals/sendPaymentModal';
export * from './modals/sendVippsInvoiceModal';
export * from './modals/bankAccountModal';
export * from './modals/unsavedChangesModal';
export * from './modals/registerPaymentModal';
export * from './modals/activateAPModal';
export * from './modals/approveModal';
export * from './modals/downloadPaymentsModal';
export * from './modals/singleTextFieldModal';
export * from './modals/licenseAgreementModal';
export * from './modals/brRegModal/brRegModal';
export * from './modals/manageProductsModal';
export * from './modals/bankModal';
export * from './modals/changelog-modal/changelog-modal';

export const MODALS = [
    UniConfirmModalV2,
    UniConfirmModalWithList,
    UniAddressModal,
    UniPhoneModal,
    UniEmailModal,
    UniSendEmailModal,
    UniSendVippsInvoiceModal,
    UniSendPaymentModal,
    UniBankAccountModal,
    UniUnsavedChangesModal,
    UniRegisterPaymentModal,
    UniActivateAPModal,
    UniApproveModal,
    UniDownloadPaymentsModal,
    SingleTextFieldModal,
    LicenseAgreementModal,
    UniBrRegModal,
    ManageProductsModal,
    UniBankModal,
    UniChangelogModal,
    SubCompanyModal
];

