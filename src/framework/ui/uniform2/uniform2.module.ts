import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultivalueComponent } from '@uni-framework/ui/uniform2/controls/multivalue-input/multivalue-input.component';
import { TextInputComponent } from '@uni-framework/ui/uniform2/controls/text-input/text-input.component';
import { Uniform2Component } from '@uni-framework/ui/uniform2/uniform2/uniform2.component';
import { PropertyToControlNamePipe } from '@uni-framework/ui/uniform2/pipes/property-to-control-name.pipe';
import { UniField2 } from '@uni-framework/ui/uniform2/uni-field/uni-field.component';
import { UniTooltipModule } from '@uni-framework/ui/tooltip/tooltip.module';
import { IsRequiredPipe } from '@uni-framework/ui/uniform2/pipes/is-required.pipe';
import { UniFieldset2 } from '@uni-framework/ui/uniform2/uni-fieldset/uni-fieldset.component';
import { UniSection2 } from '@uni-framework/ui/uniform2/uni-section/uni-section.component';
import { TransformConfigPipe } from '@uni-framework/ui/uniform2/pipes/transform-config.pipe';
import { ShowErrorComponent } from '@uni-framework/ui/uniform2/showError.component';
import { UniForm2NavigationDirective } from '@uni-framework/ui/uniform2/uniform2/uniform2-navigation.directive';
import { StaticTextInputComponent } from '@uni-framework/ui/uniform2/controls/static-text-input/static-text-input.component';
import { ButtonInputComponent } from '@uni-framework/ui/uniform2/controls/button-input/button-input.component';
import { EmailInputComponent } from '@uni-framework/ui/uniform2/controls/email-input/email-input.component';
import { TextAreaInputComponent } from '@uni-framework/ui/uniform2/controls/textarea-input/textarea-input.component';
import { PasswordInputComponent } from '@uni-framework/ui/uniform2/controls/password-input/password-input.component';
import { UrlInputComponent } from '@uni-framework/ui/uniform2/controls/url-input/url-input.component';
import { HyperlinkInputComponent } from '@uni-framework/ui/uniform2/controls/hyperlink-input/hyperlink-input.component';
import { CheckboxInputComponent } from '@uni-framework/ui/uniform2/controls/checkbox-input/checkbox-input.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxModule, MatRadioModule, MatSlideToggleModule } from '@angular/material';
import { RadioInputComponent } from '@uni-framework/ui/uniform2/controls/radio-input/radio-input.component';
import { NumericInputComponent } from '@uni-framework/ui/uniform2/controls/numeric-input/numeric-input.component';
import { AutocompleteInputComponent } from '@uni-framework/ui/uniform2/controls/autocomplete-input/autocomplete-input.component';
import { AutocompleteListComponent } from '@uni-framework/ui/uniform2/controls/autocomplete-input/autocomplete-list.component';
import { ClickOutsideDirective } from '@uni-framework/ui/uniform2/clickOutside';
import { DateInputComponent } from '@uni-framework/ui/uniform2/controls/date-input/date-input.component';
import { CalendarInputComponent } from '@uni-framework/ui/uniform2/controls/date-input/calendar-input/calendar-input.component';
import { UniSearchInputComponent } from '@uni-framework/ui/uniform2/controls/unisearch-input/unisearch-input.component';
import { UniSearchModule } from '@uni-framework/ui/unisearch';
import { UniSearchEmployeeConfig } from '@app/services/common/uniSearchConfig/uniSearchEmployeeConfig';
import { SelectInputComponent } from '@uni-framework/ui/uniform2/controls/select-input/select-input.component';
import { UniSelect } from '@uni-framework/ui/uniform';
import { UniSelectModule } from '@uni-framework/ui/uni-select/select.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        UniTooltipModule,
        NgSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSlideToggleModule,
        UniSearchModule,
        UniSelectModule
    ],
    declarations: [
        Uniform2Component,
        TextInputComponent,
        TextAreaInputComponent,
        PasswordInputComponent,
        NumericInputComponent,
        EmailInputComponent,
        UrlInputComponent,
        StaticTextInputComponent,
        HyperlinkInputComponent,
        MultivalueComponent,
        ButtonInputComponent,
        CheckboxInputComponent,
        RadioInputComponent,
        AutocompleteInputComponent,
        AutocompleteListComponent,
        DateInputComponent,
        CalendarInputComponent,
        UniSearchInputComponent,
        SelectInputComponent,
        PropertyToControlNamePipe,
        IsRequiredPipe,
        TransformConfigPipe,
        UniField2,
        UniFieldset2,
        UniSection2,
        ShowErrorComponent,
        UniForm2NavigationDirective,
        ClickOutsideDirective
    ],
    exports: [
        Uniform2Component,
        TextInputComponent,
        TextAreaInputComponent,
        PasswordInputComponent,
        NumericInputComponent,
        EmailInputComponent,
        UrlInputComponent,
        StaticTextInputComponent,
        HyperlinkInputComponent,
        MultivalueComponent,
        ButtonInputComponent,
        CheckboxInputComponent,
        RadioInputComponent,
        AutocompleteInputComponent,
        AutocompleteListComponent,
        DateInputComponent,
        CalendarInputComponent,
        UniSearchInputComponent,
        SelectInputComponent,
        PropertyToControlNamePipe,
        IsRequiredPipe,
        TransformConfigPipe,
        UniField2,
        UniFieldset2,
        UniSection2,
        ShowErrorComponent,
        UniForm2NavigationDirective,
        ClickOutsideDirective
    ],
    providers: [
        // external service to simplify unisearch configuration
        UniSearchEmployeeConfig
    ]
})
export class Uniform2Module { }
