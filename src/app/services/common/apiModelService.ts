import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../../framework/core/authService';
import {ErrorService} from './errorService';

@Injectable()
export class ApiModelService {
    private models: Array<ApiModel>;
    private modules: Array<ModuleConfig>;

    constructor(private uniHttpService: UniHttp,
        private errorService: ErrorService,
        protected authService: AuthService,
        private http: Http) {
        if (this.authService) {
            this.authService.authentication$.subscribe(change => this.invalidateCache());
        }
    }

    public getModel(name: string): ApiModel {
        if (this.models) {
            return this.models.find(x => x.Name === name);
        }

        return null;
    }

    public getModels(): Array<ApiModel> {
        this.models.forEach(x => {
            x.Expanded = false;
            x.Selected = false;
        });
        return this.models;
    }

    public getField(model: ApiModel, field: string) {
        return model.Fields[field.toLowerCase()];
    }

    public getModules(): Array<ModuleConfig> {
        this.modules.forEach(x => {
            x.Expanded = false;
            x.ModelList.forEach(m => {
                m.Expanded = false
                m.Selected = false;
            });
        });

        return this.modules;
    }

    private invalidateCache() {
        this.models = null;
    }

    public loadModelCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.models) {
                // get models and modelconfig from API and add it to the cache
                Observable.forkJoin(
                    this.uniHttpService.usingMetadataDomain()
                        .asGET()
                        .withEndPoint('allmodels')
                        .send()
                        .map(response => response.json()),
                    this.http.get('assets/modelconfig/modelconfig.json')
                        .map(x => x.json())
                ).subscribe(data => {
                    let models: Array<any> = data[0];
                    let setup: UniModuleAndModelSetup = data[1];

                    let otherModule = new ModuleConfig();
                    otherModule.Name = 'Other';
                    otherModule.Translated = 'Annet';
                    otherModule.ModelList = [];

                    // set up models and module
                    models.forEach(model => {
                        let modelSetup = setup.Models.find(x => x.Name === model.Name);
                        if (modelSetup) {
                            model.DetailsUrl = modelSetup.Url;
                            model.TranslatedName = modelSetup.Translated;
                        }

                        let modules = setup.Modules.filter(x => x.Models && x.Models.indexOf(model.Name) !== -1);

                        if (modules.length > 0) {
                            modules.forEach(module => {
                                if (!module.ModelList) {
                                    module.ModelList = [];
                                }

                                module.ModelList.push(model);
                            });
                        } else {
                            otherModule.ModelList.push(model);
                        }
                    });

                    setup.Modules.push(otherModule);

                    this.models = models;
                    this.modules = setup.Modules;

                    resolve(true);

                },
                err => {
                    this.errorService.handle(err);
                    reject(err);
                });
            } else {
                resolve(true);
            }
        });
    }
}

export class ApiModel {
    public Name: string;
    public Fields: any;

    public Expanded?: boolean;
    public Selected?: boolean;
    public DetailsUrl?: string;
    public TranslatedName?: string;
}

export class UniModuleAndModelSetup {
    public Modules: Array<ModuleConfig>;
    public Models: Array<ModelConfig>;
}

export class ModuleConfig {
    public Name: string;
    public Translated: string;
    public Models: Array<string>;
    public ModelList: Array<any>;
    public Expanded: boolean;
}

export class ModelConfig {
    public Name: string;
    public Translated: string;
    public Url: string;
}
