import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {UniHttp} from '../../../framework/core/http/http';
import {AuthService} from '../../authService';
import {ErrorService} from './errorService';

@Injectable()
export class ApiModelService {
    private models: ApiModel[];
    private modules: ModuleConfig[];

    constructor(private uniHttpService: UniHttp,
        private errorService: ErrorService,
        protected authService: AuthService,
        private http: HttpClient
    ) {
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

    public getField(model: ApiModel, fieldName: string) {
        return model.Fields && model.Fields.find(field => {
            if (field.Publicname && fieldName) {
                return field.Publicname.toLowerCase() === fieldName.toLowerCase();
            }
        });
    }

    public getModules(): ModuleConfig[] {
        this.modules.forEach(x => {
            x.Expanded = false;
            x.ModelList.forEach(m => {
                m.Expanded = false;
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
                        .map(response => response.body),
                    this.http.get<UniModuleAndModelSetup>(
                        'assets/modelconfig/modelconfig.json',
                        {observe: 'body'}
                    )
                ).subscribe(data => {
                    const models: Array<any> = data[0];
                    const setup: UniModuleAndModelSetup = data[1];

                    const otherModule = <ModuleConfig> {};
                    otherModule.Name = 'Other';
                    otherModule.Translated = 'Annet';
                    otherModule.ModelList = [];

                    // set up models and module
                    models.forEach(model => {
                        const modelSetup = setup.Models.find(x => x.Name === model.Name);
                        if (modelSetup) {
                            model.DetailsUrl = modelSetup.Url;
                            model.TranslatedName = modelSetup.Translated;
                        }

                        const modules = setup.Modules.filter(x => x.Models && x.Models.indexOf(model.Name) !== -1);

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
