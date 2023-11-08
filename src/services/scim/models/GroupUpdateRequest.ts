/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupMember } from './GroupMember';
import type { NutidGroupExtensionV1 } from './NutidGroupExtensionV1';
import type { SCIMSchema } from './SCIMSchema';

export type GroupUpdateRequest = {
    id: string;
    schemas: Array<SCIMSchema>;
    externalId?: string;
    displayName: string;
    members?: Array<GroupMember>;
    'https://scim.eduid.se/schema/nutid/group/v1'?: NutidGroupExtensionV1;
};

