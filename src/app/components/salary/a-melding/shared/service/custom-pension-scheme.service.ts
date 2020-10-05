import { Injectable } from '@angular/core';
import { PensionSchemeSupplierService } from '@app/components/salary/a-melding/shared/service/pension-scheme-supplier.service';
import { PensionSchemeService, IPensionSchemeDto } from '@app/components/salary/a-melding/shared/service/pension-scheme.service';
import { PensionSchemeSupplier } from '@uni-entities';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UniFieldLayout, FieldType } from '@uni-framework/ui/uniform';

@Injectable()
export class CustomPensionSchemeService {

    constructor(
        private supplierService: PensionSchemeSupplierService,
        private schemeService: PensionSchemeService,
    ) { }

    createCustomScheme(scheme: IPensionSchemeDto): Observable<IPensionSchemeDto> {
        if (!scheme?.identificator || !scheme?.name) {
            return of(scheme);
        }
        return this.supplierService.Post(<PensionSchemeSupplier>{Identificator: scheme.identificator, Name: scheme.name})
            .pipe(
                switchMap(() => this.schemeService.saveDto(scheme))
            );
    }

    getLayout(): UniFieldLayout[] {
        return <UniFieldLayout[]>[
            {
                Property: 'identificator',
                Label: 'SALARY.CUSTOM_PENSION_SCHEME.IDENTIFICATOR',
                FieldType: FieldType.TEXT,
            },
            {
                Property: 'name',
                Label: 'SALARY.CUSTOM_PENSION_SCHEME.NAME',
                FieldType: FieldType.TEXT,
            }
        ];
    }
}
