import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UniFieldLayout} from '../../../../framework/ui/uniform/index';
import {IToolbarConfig} from '../../common/toolbar/toolbar';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {FieldType} from '../../../../framework/ui/uniform/index';
import {IUniSaveAction} from '../../../../framework/save/save';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {CustomDimensionService, DimensionSettingsService} from '../../../services/commonServicesModule';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';

@Component({
    selector: 'uni-custom-dimension',
    templateUrl: './customDimension.html'
})

export class UniCustomDimension implements OnInit {

    private currentDimensionType: number;
    private currentDimensionID: number;
    private currentDimension;
    private isActive: boolean = true;
    private toastBody: string = 'Denne dimensjonen er satt inaktiv, og det kan derfor ikke redigeres/opprettes nye.'
        + ' For å endre dette, gå til Innstillinger - Dimensjoner.';

    public config$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public fields$: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private model$: BehaviorSubject<any> = new BehaviorSubject(null);

    public saveActions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: (completeEvent) => this.save(completeEvent),
            main: true,
            disabled: !this.isActive
        }
    ];

    private toolbarconfig: IToolbarConfig = {
        title: '',
        navigation: {
            add: () => this.add()
        }
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private customDimensionService: CustomDimensionService,
        private dimensionSettingsService: DimensionSettingsService,
        private tabService: TabService,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.fields$.next(this.getDimensionFields());
        this.route.params.subscribe((params) => {
            this.currentDimensionType = +params['id'];
            this.route.queryParams.subscribe((queryParams) => {
                this.currentDimensionID = +queryParams['dimensionID'];
                if (!this.currentDimensionType) {
                    this.router.navigateByUrl('/');
                } else {
                    if (!this.currentDimensionID) {
                       this.setDimension(this.getNewCustomDimension());
                    } else {
                        this.customDimensionService.getCustomDimension(this.currentDimensionType, this.currentDimensionID)
                        .subscribe((dim) => {
                            this.setDimension(dim);
                        });
                    }
                }
            });
        });
    }

    private setDimension(dim: any) {
        this.model$.next(dim);
        if (!this.currentDimension) {
            this.customDimensionService.getMetadata().subscribe((dims) => {
                this.currentDimension = dims.find((dimension) => {
                    return dimension.Dimension === this.currentDimensionType;
                });
                this.setMetadata(dim);
            });
        } else {
            this.setMetadata(dim);
        }
    }

    private setMetadata(dim: any) {
        const tabTitle = dim.ID ? dim.Name : 'Ny dimensjon';

        this.tabService.addTab({
            url: '/dimensions/customdimension/' + this.currentDimensionType + '/?dimensionID=' + dim.ID || '0',
            name: tabTitle,
            active: true,
            moduleID: UniModules.Projects
        });

        this.isActive = this.currentDimension.IsActive;
        this.toolbarconfig.title = this.currentDimension.Label;
        this.toolbarconfig.subheads = [{ title: dim.ID ? dim.Name : 'Ny' }];

        if (!this.isActive) {
            this.fields$.next(this.getDimensionFields());
            this.updateSaveActions();
            this.toastService.addToast('OBS: Inaktiv dimensjon!', ToastType.warn, 0, this.toastBody);
        }
    }

    private save(done: Function) {
       const model = this.model$.getValue();
       this.customDimensionService.saveCustomDimension(this.currentDimensionType, model).subscribe((res) => {
            done('Lagring vellykket');
            this.router.navigateByUrl('dimensions/customdimension/' + this.currentDimensionType + '?dimensionID=' + res.ID);
       }, (err) => {
            done('Lagring feilet');
       });
    }

    private add() {
        if (!this.currentDimension.IsActive) {
            this.toastService.addToast('OBS: Inaktiv dimensjon!', ToastType.warn, 0, this.toastBody);
            return;
        }
        this.router.navigateByUrl('dimensions/customdimension/' + this.currentDimensionType + '?dimensionID=0');
    }

    private getNewCustomDimension() {
        return {
            Name: '',
            Description: '',
            Number: 0
        };
    }

    private updateSaveActions() {
        this.saveActions = [
            {
                label: 'Lagre',
                action: (completeEvent) => this.save(completeEvent),
                main: true,
                disabled: !this.isActive
            }
        ];
    }

    private getDimensionFields(): UniFieldLayout[] {
        return [
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Navn',
                Property: 'Name',
                ReadOnly: !this.isActive
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Beskrivelse',
                Property: 'Description',
                ReadOnly: !this.isActive
            },
            <any>{
                FieldType: FieldType.TEXT,
                Label: 'Number',
                Property: 'Number',
                ReadOnly: !this.isActive
            }
        ];
    }

}
