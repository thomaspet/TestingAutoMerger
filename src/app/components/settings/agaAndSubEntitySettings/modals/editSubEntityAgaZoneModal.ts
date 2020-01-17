import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { SubEntity } from '@uni-entities';
import { BehaviorSubject } from 'rxjs';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';

export interface IMuniAGAZone {
    ZoneName: string;
    ZoneID: number;
    MunicipalityNo: string;
    MunicipalityName: string;
}

@Component({
    selector: 'uni-edit-aga-zone-modal',
    templateUrl: './editSubentityAgaZoneModal.html',
    styleUrls: ['./editSubentityAgaZoneModal.sass']
})
export class EditSubEntityAgaZoneModal implements OnInit, IUniModal {
    @Output() onClose: EventEmitter<SubEntity[]> = new EventEmitter();
    @Input() options?: IModalOptions;
    forceCloseValueResolver?: () => any;

    config$: BehaviorSubject<any> = new BehaviorSubject({});
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    model$: BehaviorSubject<SubEntity[]> = new BehaviorSubject([]);
    constructor() { }

    ngOnInit() {
        this.model$.next(this.options.data.subEntities);
        this.fields$.next(this.getFields(this.options.data.subEntities, this.options.data.municipalAgaZones));
        this.forceCloseValueResolver = () => this.close();
    }

    private getFields(subEntities: SubEntity[], municipalAgaZones: IMuniAGAZone[]) {
        return subEntities
            .map((subEntity, i) =>
                this.getField(
                    subEntity,
                    municipalAgaZones.filter(muni => muni.MunicipalityNo === subEntity.MunicipalityNo),
                    `[${i}].AgaZone`,
                )
            );
    }

    private getField(subEntity: SubEntity, municipalAgaZones: IMuniAGAZone[], name: string): UniFieldLayout {
        const label = subEntity.BusinessRelationInfo && subEntity.BusinessRelationInfo.Name;
        return <UniFieldLayout>{
            Property: name,
            Label: `${subEntity.OrgNumber} - ${label}`,
            FieldType: FieldType.DROPDOWN,
            Options: {
                source: municipalAgaZones,
                template: (muniAga: IMuniAGAZone) => `${muniAga.ZoneName}`,
                valueProperty: `ZoneID`,
                // displayProperty: 'ZoneName',
            }
        };
    }

    close() {
        this.onClose.next(this.model$.getValue());
    }
}
