import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Uniform2Component } from '@uni-framework/ui/uniform2/uniform2/uniform2.component';
import { model as userModel } from './models';
import * as _ from 'lodash';
import { textConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/text.config';
import { multivalueConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/multivalue.config';
import { staticTextConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/static-text.config';
import { buttonConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/button.config';
import { emailConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/email.config';
import { textareaConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/textarea.config';
import { passwordConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/password.config';
import { urlConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/url.config';
import { hyperlinkConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/hyperlink.config';
import { checkboxConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/checkbox.config';
import { radioGroupConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/radio-group.config';
import { numericConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/numeric.config';
import { autocompleteConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/autocomplete.config';
import { dateConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/date.config';
import { UniSearchEmployeeConfig } from '@app/services/common/uniSearchConfig/uniSearchEmployeeConfig';
import { uniSearchConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/unisearch.config';
import { selectConfig } from '@uni-framework/ui/uniform2/uniform2-test/fields/select.config';

@Component({
    selector: 'my-app',
    templateUrl: './uniform2-test.component.html'
})

export class Uniform2TestComponent  implements OnInit {
    constructor(private uniSearchConfigGenerator: UniSearchEmployeeConfig) {
    }

    @ViewChild('form') form: Uniform2Component;
    name = 'Angular 6';
    errors = null;
    warnings = null;
    model = null;
    _model = userModel;
    config = textConfig;
    multivalueConfig = multivalueConfig;
    fields;

    ngOnInit() {
        setTimeout(() => {
            this.fields = [
                selectConfig,
                this.config,
                uniSearchConfig(this.uniSearchConfigGenerator),
                dateConfig,
                this.multivalueConfig,
                Object.assign({}, this.config, {
                    property: 'name.lastname',
                    label: 'Last name',
                    hidden: false
                }),
                staticTextConfig,
                autocompleteConfig,
                buttonConfig,
                emailConfig,
                textareaConfig,
                passwordConfig,
                urlConfig,
                hyperlinkConfig,
                checkboxConfig,
                radioGroupConfig,
                numericConfig
            ];
        }, 2000);
        setTimeout(() => {
            this.model = this._model;
        }, 1000);

        setTimeout(() => {
            this.model = {
                name: {
                    firstname: 'Anders',
                    lastname: 'Urrang',
                },
                age: 29,
                data: {
                    site: 'http://mysite.com',
                    phone: {
                        model: 2
                    },
                    gender: { id: 1, name: 'Kvinne' },
                },
                text: {
                    very: {
                        deeper: {
                            ID: 1,
                            Text: 'text1'
                        }
                    }
                }
            };
        }, 3000);
    }

    onFocus($event) {

    }

    onBlur($event) {

    }

    onChange(changes: SimpleChanges) {
        if (changes['EmployeeSearchResultID'] && changes['EmployeeSearchResultID'].currentValue) {
            this.fields[1].type = 'text';
            this.fields = _.cloneDeep(this.fields);
        }
    }

    onSourceChange($event) {

    }

    onError($event) {
        console.log('Errors: ', $event);
        this.errors = $event;
    }

    onWarning($event) {
        console.log('Warnings: ', $event);
        this.warnings = $event;
    }

    onMoveForward($event) {
        console.log('forward: ', $event);
    }

    onMoveBackward($event) {
        console.log('backward: ', $event);
    }
}
