import {UniConfirmModalV2} from './presets/confirmModal';
import {UniAddressModal} from './presets/addressModal';
import {UniPhoneModal} from './presets/phoneModal';
import {UniEmailModal} from './presets/emailModal';
import {UniBankAccountModal} from './presets/bankAccountModal';
import {UniUnsavedChangesModal} from './presets/unsavedChangesModal';
import {UniRegisterPaymentModal} from './presets/registerPaymentModal';
import {UniActivateAPModal} from './presets/activateAPModal';

export * from './modalService';
export * from './presets/confirmModal';
export * from './presets/addressModal';
export * from './presets/phoneModal';
export * from './presets/emailModal';
export * from './presets/bankAccountModal';
export * from './presets/unsavedChangesModal';
export * from './presets/registerPaymentModal';
export * from './presets/activateAPModal';

export const MODALS = [
    UniConfirmModalV2,
    UniAddressModal,
    UniPhoneModal,
    UniEmailModal,
    UniBankAccountModal,
    UniUnsavedChangesModal,
    UniRegisterPaymentModal,
    UniActivateAPModal
];

