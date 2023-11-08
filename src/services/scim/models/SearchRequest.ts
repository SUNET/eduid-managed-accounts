/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SCIMSchema } from './SCIMSchema';

export type SearchRequest = {
    schemas?: Array<SCIMSchema>;
    filter: string;
    startIndex?: number;
    count?: number;
    attributes?: Array<string>;
};

