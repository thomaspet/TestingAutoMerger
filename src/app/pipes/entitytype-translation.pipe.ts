import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'entitytypeTranslation'
})
export class EntitytypeTranslationPipe implements PipeTransform {

  transform(entityType: string, args?: any): any {
    switch (entityType.toLowerCase()) {
      case 'customerinvoice':
        return 'faktura';
      case 'customerorder':
        return 'ordre';
      case 'customerquote':
        return 'tilbud';
      case 'supplierinvoice':
        return 'leverandørfaktura';
      case 'project':
        return 'prosjekt';
      case 'customer':
        return 'kunde';
    }
    return entityType;
  }

}
