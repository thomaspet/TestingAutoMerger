import {ComponentLayoutDto} from '@uni-framework/ui/uniform/interfaces/component-layout-dto.interface';
import {UniFieldLayout} from '@uni-framework/ui/uniform/interfaces/uni-field-layout.interface';

export class UniComponentLayout extends ComponentLayoutDto {
    public Fields: Array<UniFieldLayout> = [];
}
