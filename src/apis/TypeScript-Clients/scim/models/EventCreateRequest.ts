/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { NutidEventExtensionV1 } from './NutidEventExtensionV1';
import type { SCIMSchema } from './SCIMSchema';

export type EventCreateRequest = {
    'https://scim.eduid.se/schema/nutid/event/v1': NutidEventExtensionV1;
    schemas: Array<SCIMSchema>;
    externalId?: string;
};

