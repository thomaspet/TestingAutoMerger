import {UniFieldBuilder} from './builders/uniFieldBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniGroupBuilder} from './builders/uniGroupBuilder';
import {UniFormBuilder} from './builders/uniFormBuilder';
import {UniComboGroupBuilder} from './builders/uniComboGroupBuilder';

export type UniElementBuilder = UniFieldBuilder|UniFieldsetBuilder|UniGroupBuilder|UniComboGroupBuilder;
export type UniElementBuilderCollection = Array<UniElementBuilder>;
export type UniFormBuilderCollection = Array<UniFormBuilder>;
