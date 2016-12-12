import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
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
import {EmailForm} from './modals/emailModal';
import {PhoneForm} from './modals/phoneModal';
import {RegisterPaymentForm} from './modals/registerPaymentModal';
import {UniFrameworkModule} from '../../../framework/frameworkModule';
import {UniTableModule} from 'unitable-ng2/main';
import {UniFormModule} from 'uniform-ng2/main';
import {AddressModal} from './modals/addressModal';
import {EmailModal} from './modals/emailModal';
import {PhoneModal} from './modals/phoneModal';
import {AltinnAuthenticationDataModal} from './modals/AltinnAuthenticationDataModal';
import {BankAccountModal} from './modals/bankAccountModal';
import {RegisterPaymentModal} from './modals/registerPaymentModal';
import {routes as AppCommonRoutes} from './appCommonRoutes';
import {UniBreadcrumbs} from './toolbar/breadcrumbs';
import {UniStatusTrack} from './toolbar/statustrack';
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
import {UniPoster, TextWidget, ContactWidget, TableWidget, AlertsWidget} from './poster/poster';

@NgModule({
    imports: [
        BrowserModule,
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
        UniUploadFileButton
    ],
    entryComponents: [
        AddressForm,
        BankAccountForm,
        EmailForm,
        PhoneForm,
        RegisterPaymentForm,
        AltinnAuthenticationDataModalContent,
        SendEmailForm,
        SendEmailModal,
        ImageModalContent
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
        UniUploadFileButton
    ]
})
export class AppCommonModule {
}
