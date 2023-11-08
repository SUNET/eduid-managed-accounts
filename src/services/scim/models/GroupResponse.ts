/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupMember } from './GroupMember';
import type { Meta } from './Meta';
import type { NutidGroupExtensionV1 } from './NutidGroupExtensionV1';
import type { SCIMSchema } from './SCIMSchema';

/**
 * This is basically the implementation of the common attributes defined in RFC7643 #3.1. (Common Attributes)
 */
export type GroupResponse = {
    id: string;
    meta: Meta;
    schemas: Array<SCIMSchema>;
    externalId?: string;
    displayName: string;
    members?: Array<GroupMember>;
    'https://scim.eduid.se/schema/nutid/group/v1'?: NutidGroupExtensionV1;
};

