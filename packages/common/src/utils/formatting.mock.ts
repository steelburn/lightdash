import {
    DimensionType,
    FieldType,
    MetricType,
    type AdditionalMetric,
    type Dimension,
    type Metric,
    type TableCalculation,
} from '../index';

export const dimension: Dimension = {
    fieldType: FieldType.DIMENSION,
    description: undefined,
    type: DimensionType.STRING,
    name: 'name',
    label: 'label',
    table: 'table',
    tableLabel: 'tableLabel',
    sql: 'sql',
    hidden: false,
    groups: [],
};

export const metric: Metric = {
    ...dimension,
    fieldType: FieldType.METRIC,
    type: MetricType.COUNT,
};

export const tableCalculation: TableCalculation = {
    name: 'name',
    displayName: 'displayName',
    sql: 'sql',
};

export const additionalMetric: AdditionalMetric = {
    ...metric,
    type: MetricType.COUNT,
};
