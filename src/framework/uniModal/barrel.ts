import {UniConfirmModalV2} from './presets/confirmModal';
import {UniConfirmModalWithList} from './presets/confirmModalWithList';
import {UniAddressModal} from './presets/addressModal';
import {UniPhoneModal} from './presets/phoneModal';
import {UniEmailModal} from './presets/emailModal';
import {UniSendEmailModal} from './presets/sendEmailModal';
import {UniSendPaymentModal} from './presets/sendPaymentModal';
import {UniSendVippsInvoiceModal} from './presets/sendVippsInvoiceModal';
import {UniBankAccountModal} from './presets/bankAccountModal';
import {UniUnsavedChangesModal} from './presets/unsavedChangesModal';
import {UniRegisterPaymentModal} from './presets/registerPaymentModal';
import {UniActivateAPModal} from './presets/activateAPModal';
import {UniApproveModal} from './presets/approveModal';
import {UniDownloadPaymentsModal} from './presets/downloadPaymentsModal';

export * from './modalService';
export * from './presets/confirmModal';
export * from './presets/confirmModalWithList';
export * from './presets/addressModal';
export * from './presets/phoneModal';
export * from './presets/emailModal';
export * from './presets/sendEmailModal';
export * from './presets/sendPaymentModal';
export * from './presets/sendVippsInvoiceModal';
export * from './presets/bankAccountModal';
export * from './presets/unsavedChangesModal';
export * from './presets/registerPaymentModal';
export * from './presets/activateAPModal';
export * from './presets/approveModal';
export * from './presets/downloadPaymentsModal';

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
];

