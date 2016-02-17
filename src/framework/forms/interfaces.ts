import {UniInputBuilder} from './builders/uniInputBuilder';
import {UniFieldsetBuilder} from './builders/uniFieldsetBuilder';
import {UniSectionBuilder} from './builders/uniSectionBuilder';
import {UniFormBuilder} from './builders/uniFormBuilder';
import {UniComboInputBuilder} from './builders/uniComboInputBuilder';

export type UniElementBuilder = UniInputBuilder|UniFieldsetBuilder|UniSectionBuilder|UniComboInputBuilder;
