import {FieldLayoutDto} from '@uni-framework/ui/uniform/interfaces/field-layout-dto.interface';

export class ComponentLayoutDto {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Name: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}
