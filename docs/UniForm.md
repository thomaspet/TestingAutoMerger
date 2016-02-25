## UniForm

UniForm is a component to display forms based on configuration files.

## UniForm Component

To display a UniForm inside your component you have different ways:

1. Declare it explicitly in a template

```html

<uni-form [config]="config" (uniSubmitEvent)="onSubmit()"></uni-form>

```

Notice you have two elements:
 - an *input*: the **config** 
 - an *output*: the **submit event**
 
2. Load with the `UniComponentLoader`

Template:
```html
<uni-component-loader></uni-component-loader>
```

Component declaration:
```ts
@ViewChild(UniComponentLoader)
uniCmpLoader: UniComponentLoader;
```

Load component explicitly:
```ts
self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
    cmp.instance.config = self.form;
    setTimeout(() => {
        self.formInstance = cmp.instance;
        console.log(self.formInstance);
    }, 100);
});
```

## How to Build a UniField

1. From a configuration object (can come from server):

```ts
interface IFieldLayout {
	ComponentLayoutID: number;
	EntityType: string;
	Property: string;
	Placement: number;
	Hidden: boolean;
	FieldType: FieldType;
	ReadOnly: boolean;
	LookupField: boolean;
	Label: string;
	Description: string;
	HelpText: string;
	FieldSet: number;
	Section: number;
	Legend: string;
	StatusID: number;
	ID: number;
	Deleted: boolean;
	CustomFields: any;
}
```

```ts
var field = UniField.fromLayoutConfig(x: IFieldLayout);
```

2. Programatically:

Using the corresponding Builder.

```typescript
var vatCode = new UniFieldBuilder();
vatCode.setLabel('MVA kode.')
    .setModel(this.model)
    .setModelField('VatCode')
    .setType(UNI_CONTROL_DIRECTIVES[FieldType.TEXT])
```

## Grouping UniFields

Level of grouping has that priority:

`UniForm -> UniSection -> UniFieldset -> UniComboField -> UniField`

UniForm, UniSection, UniFieldset and UniComboField are grouping elements.

That means they have the ability of adding fields:

```ts
var field = new UniField();
var group = new UniSection();
group.addField(field);
```

**UniForm can't contain other UniForms**
**UniSection can't contain other UniSections or UniForms**
**UniFieldset can't contain other UniForms, UniSections or UniFieldsets**
**UniComboField can't contain other UniForms, UniSections, UniFieldsets or UniComboFields**