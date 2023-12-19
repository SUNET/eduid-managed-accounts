/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventCreateRequest } from '../models/EventCreateRequest';
import type { EventResponse } from '../models/EventResponse';
import type { GroupCreateRequest } from '../models/GroupCreateRequest';
import type { GroupResponse } from '../models/GroupResponse';
import type { GroupUpdateRequest } from '../models/GroupUpdateRequest';
import type { InviteCreateRequest } from '../models/InviteCreateRequest';
import type { InviteResponse } from '../models/InviteResponse';
import type { InviteUpdateRequest } from '../models/InviteUpdateRequest';
import type { ListResponse } from '../models/ListResponse';
import type { SearchRequest } from '../models/SearchRequest';
import type { StatusResponse } from '../models/StatusResponse';
import type { UserCreateRequest } from '../models/UserCreateRequest';
import type { UserResponse } from '../models/UserResponse';
import type { UserUpdateRequest } from '../models/UserUpdateRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * On Get
     * @param scimId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static onGetUsersScimIdGet(
        scimId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{scim_id}',
            path: {
                'scim_id': scimId,
            },
            errors: {
                400: `Bad request`,
                404: `Not found`,
                422: `Validation Error`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * On Put
     * @param scimId
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static onPutUsersScimIdPut(
        scimId: string,
        requestBody: UserUpdateRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/Users/{scim_id}',
            path: {
                'scim_id': scimId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Not found`,
                422: `Validation Error`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * On Delete
     * @param scimId
     * @returns void
     * @throws ApiError
     */
    public static onDeleteUsersScimIdDelete(
        scimId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{scim_id}',
            path: {
                'scim_id': scimId,
            },
            errors: {
                400: `Bad request`,
                404: `Not found`,
                422: `Validation Error`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * On Post
     * POST /Users  HTTP/1.1
     * Host: example.com
     * Accept: application/scim+json
     * Content-Type: application/scim+json
     * Authorization: Bearer h480djs93hd8
     * Content-Length: ...
     *
     * {
         * "schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
         * "userName":"bjensen",
         * "externalId":"bjensen",
         * "name":{
             * "formatted":"Ms. Barbara J Jensen III",
             * "familyName":"Jensen",
             * "givenName":"Barbara"
             * }
             * }
             *
             *
             * HTTP/1.1 201 Created
             * Content-Type: application/scim+json
             * Location:
             * https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646
             * ETag: W/"e180ee84f0671b1"
             *
             * {
                 * "schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
                 * "id":"2819c223-7f76-453a-919d-413861904646",
                 * "externalId":"bjensen",
                 * "meta":{
                     * "resourceType":"User",
                     * "created":"2011-08-01T21:32:44.882Z",
                     * "lastModified":"2011-08-01T21:32:44.882Z",
                     * "location":
                     * "https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646",
                     * "version":"W\/"e180ee84f0671b1""
                     * },
                     * "name":{
                         * "formatted":"Ms. Barbara J Jensen III",
                         * "familyName":"Jensen",
                         * "givenName":"Barbara"
                         * },
                         * "userName":"bjensen"
                         * }
                         * @param requestBody
                         * @returns UserResponse Successful Response
                         * @throws ApiError
                         */
                        public static onPostUsersPost(
                            requestBody: UserCreateRequest,
                        ): CancelablePromise<UserResponse> {
                            return __request(OpenAPI, {
                                method: 'POST',
                                url: '/Users',
                                body: requestBody,
                                mediaType: 'application/json',
                                errors: {
                                    400: `Bad request`,
                                    404: `Not found`,
                                    422: `Validation Error`,
                                    500: `Internal server error`,
                                },
                            });
                        }

                        /**
                         * Search
                         * POST /Users/.search
                         * Host: scim.eduid.se
                         * Accept: application/scim+json
                         *
                         * {
                             * "schemas": ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
                             * "attributes": ["givenName", "familyName"],
                             * "filter": "id eq "takaj-jorar"",
                             * "startIndex": 1,
                             * "count": 1
                             * }
                             *
                             *
                             *
                             * HTTP/1.1 200 OK
                             * Content-Type: application/scim+json
                             * Location: https://example.com/Users/.search
                             *
                             * {
                                 * "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
                                 * "totalResults": 1,
                                 * "itemsPerPage": 1,
                                 * "startIndex": 1,
                                 * "Resources": [
                                     * {
                                         * "givenName": "Kim",
                                         * "familyName": "Svensson"
                                         * }
                                         * ]
                                         * }
                                         * @param requestBody
                                         * @returns ListResponse Successful Response
                                         * @throws ApiError
                                         */
                                        public static searchUsersSearchPost(
                                            requestBody: SearchRequest,
                                        ): CancelablePromise<ListResponse> {
                                            return __request(OpenAPI, {
                                                method: 'POST',
                                                url: '/Users/.search',
                                                body: requestBody,
                                                mediaType: 'application/json',
                                                errors: {
                                                    400: `Bad request`,
                                                    404: `Not found`,
                                                    422: `Validation Error`,
                                                    500: `Internal server error`,
                                                },
                                            });
                                        }

                                        /**
                                         * On Get All
                                         * @returns ListResponse Successful Response
                                         * @throws ApiError
                                         */
                                        public static onGetAllGroupsGet(): CancelablePromise<ListResponse> {
                                            return __request(OpenAPI, {
                                                method: 'GET',
                                                url: '/Groups',
                                                errors: {
                                                    400: `Bad request`,
                                                    404: `Not found`,
                                                    500: `Internal server error`,
                                                },
                                            });
                                        }

                                        /**
                                         * On Post
                                         * POST /Groups  HTTP/1.1
                                         * Host: example.com
                                         * Accept: application/scim+json
                                         * Content-Type: application/scim+json
                                         * Authorization: Bearer h480djs93hd8
                                         * Content-Length: ...
                                         *
                                         * {
                                             * "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
                                             * "displayName": "Test SCIMv2",
                                             * "members": []
                                             * }
                                             *
                                             *
                                             * HTTP/1.1 201 Created
                                             * Date: Tue, 10 Sep 2019 04:54:18 GMT
                                             * Content-Type: text/json;charset=UTF-8
                                             *
                                             * {
                                                 * "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
                                                 * "id": "abf4dd94-a4c0-4f67-89c9-76b03340cb9b",
                                                 * "displayName": "Test SCIMv2",
                                                 * "members": [],
                                                 * "meta": {
                                                     * "resourceType": "Group"
                                                     * }
                                                     * }
                                                     * @param requestBody
                                                     * @returns GroupResponse Successful Response
                                                     * @throws ApiError
                                                     */
                                                    public static onPostGroupsPost(
                                                        requestBody: GroupCreateRequest,
                                                    ): CancelablePromise<GroupResponse> {
                                                        return __request(OpenAPI, {
                                                            method: 'POST',
                                                            url: '/Groups',
                                                            body: requestBody,
                                                            mediaType: 'application/json',
                                                            errors: {
                                                                400: `Bad request`,
                                                                404: `Not found`,
                                                                422: `Validation Error`,
                                                                500: `Internal server error`,
                                                            },
                                                        });
                                                    }

                                                    /**
                                                     * On Get One
                                                     * GET /Groups/c3819cbe-c893-4070-824c-fe3d0db8f955  HTTP/1.1
                                                     * Host: example.com
                                                     * Accept: application/scim+json
                                                     * Content-Type: application/scim+json
                                                     * Authorization: Bearer h480djs93hd8
                                                     * Content-Length: ...
                                                     *
                                                     * HTTP/1.1 200 OK
                                                     * content-type: application/json; charset=UTF-8
                                                     * etag: W/"5e79df24f77769b475177bc7"
                                                     * location: http://scimapi.eduid.docker/scim/test/Groups/c3819cbe-c893-4070-824c-fe3d0db8f955
                                                     *
                                                     * {
                                                         * "displayName": "test group",
                                                         * "id": "c3819cbe-c893-4070-824c-fe3d0db8f955",
                                                         * "members": [],
                                                         * "meta": {
                                                             * "created": "2020-03-24T10:21:24.686000",
                                                             * "lastModified": null,
                                                             * "location": "http://scimapi.eduid.docker/scim/test/Groups/c3819cbe-c893-4070-824c-fe3d0db8f955",
                                                             * "resourceType": "Group",
                                                             * "version": "5e79df24f77769b475177bc7"
                                                             * },
                                                             * "schemas": [
                                                                 * "urn:ietf:params:scim:schemas:core:2.0:Group"
                                                                 * ]
                                                                 * }
                                                                 * @param scimId
                                                                 * @returns GroupResponse Successful Response
                                                                 * @throws ApiError
                                                                 */
                                                                public static onGetOneGroupsScimIdGet(
                                                                    scimId: string,
                                                                ): CancelablePromise<GroupResponse> {
                                                                    return __request(OpenAPI, {
                                                                        method: 'GET',
                                                                        url: '/Groups/{scim_id}',
                                                                        path: {
                                                                            'scim_id': scimId,
                                                                        },
                                                                        errors: {
                                                                            400: `Bad request`,
                                                                            404: `Not found`,
                                                                            422: `Validation Error`,
                                                                            500: `Internal server error`,
                                                                        },
                                                                    });
                                                                }

                                                                /**
                                                                 * On Put
                                                                 * PUT /Groups/c3819cbe-c893-4070-824c-fe3d0db8f955  HTTP/1.1
                                                                 * Host: example.com
                                                                 * Accept: application/scim+json
                                                                 * Content-Type: application/scim+json
                                                                 * Authorization: Bearer h480djs93hd8
                                                                 * If-Match: W/"5e79df24f77769b475177bc7"
                                                                 * Content-Length: ...
                                                                 *
                                                                 * {
                                                                     * "schemas": ["urn:ietf:params:scim:schemas:core:2.0:Group"],
                                                                     * "displayName": "Test SCIMv2",
                                                                     * "members": [
                                                                         * {
                                                                             * "value": "2819c223-7f76-453a-919d-413861904646",
                                                                             * "$ref": "https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646",
                                                                             * "display": "Babs Jensen"
                                                                             * },
                                                                             * ]
                                                                             * }
                                                                             *
                                                                             * HTTP/1.1 200 OK
                                                                             * content-type: application/json; charset=UTF-8
                                                                             * etag: W/"5e79df24f77769b475177bc7"
                                                                             * location: http://scimapi.eduid.docker/scim/test/Groups/c3819cbe-c893-4070-824c-fe3d0db8f955
                                                                             *
                                                                             * {
                                                                                 * "displayName": "test group",
                                                                                 * "id": "c3819cbe-c893-4070-824c-fe3d0db8f955",
                                                                                 * "members": [
                                                                                     * {
                                                                                         * "value": "2819c223-7f76-453a-919d-413861904646",
                                                                                         * "$ref": "https://example.com/v2/Users/2819c223-7f76-453a-919d-413861904646",
                                                                                         * "display": "Babs Jensen"
                                                                                         * },
                                                                                         * ],
                                                                                         * "meta": {
                                                                                             * "created": "2020-03-24T10:21:24.686000",
                                                                                             * "lastModified": 2020-03-25T14:42:24.686000,
                                                                                             * "location": "http://scimapi.eduid.docker/scim/test/Groups/c3819cbe-c893-4070-824c-fe3d0db8f955",
                                                                                             * "resourceType": "Group",
                                                                                             * "version": "3e79d424f77269f475177bc5"
                                                                                             * },
                                                                                             * "schemas": [
                                                                                                 * "urn:ietf:params:scim:schemas:core:2.0:Group"
                                                                                                 * ]
                                                                                                 * }
                                                                                                 * @param scimId
                                                                                                 * @param requestBody
                                                                                                 * @returns GroupResponse Successful Response
                                                                                                 * @throws ApiError
                                                                                                 */
                                                                                                public static onPutGroupsScimIdPut(
                                                                                                    scimId: string,
                                                                                                    requestBody: GroupUpdateRequest,
                                                                                                ): CancelablePromise<GroupResponse> {
                                                                                                    return __request(OpenAPI, {
                                                                                                        method: 'PUT',
                                                                                                        url: '/Groups/{scim_id}',
                                                                                                        path: {
                                                                                                            'scim_id': scimId,
                                                                                                        },
                                                                                                        body: requestBody,
                                                                                                        mediaType: 'application/json',
                                                                                                        errors: {
                                                                                                            400: `Bad request`,
                                                                                                            404: `Not found`,
                                                                                                            422: `Validation Error`,
                                                                                                            500: `Internal server error`,
                                                                                                        },
                                                                                                    });
                                                                                                }

                                                                                                /**
                                                                                                 * On Delete
                                                                                                 * @param scimId
                                                                                                 * @returns void
                                                                                                 * @throws ApiError
                                                                                                 */
                                                                                                public static onDeleteGroupsScimIdDelete(
                                                                                                    scimId: string,
                                                                                                ): CancelablePromise<void> {
                                                                                                    return __request(OpenAPI, {
                                                                                                        method: 'DELETE',
                                                                                                        url: '/Groups/{scim_id}',
                                                                                                        path: {
                                                                                                            'scim_id': scimId,
                                                                                                        },
                                                                                                        errors: {
                                                                                                            400: `Bad request`,
                                                                                                            404: `Not found`,
                                                                                                            422: `Validation Error`,
                                                                                                            500: `Internal server error`,
                                                                                                        },
                                                                                                    });
                                                                                                }

                                                                                                /**
                                                                                                 * Search
                                                                                                 * POST /Groups/.search
                                                                                                 * Host: scim.eduid.se
                                                                                                 * Accept: application/scim+json
                                                                                                 *
                                                                                                 * {
                                                                                                     * "schemas": ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
                                                                                                     * "filter": "displayName eq "some display name"",
                                                                                                     * }
                                                                                                     *
                                                                                                     * HTTP/1.1 200 OK
                                                                                                     * Content-Type: application/scim+json
                                                                                                     * Location: https://example.com/Users/.search
                                                                                                     *
                                                                                                     * {
                                                                                                         * "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
                                                                                                         * "totalResults": 1,
                                                                                                         * "Resources": [
                                                                                                             * {
                                                                                                                 * "displayName": "test group",
                                                                                                                 * "id": "46aee99f-f417-41fc-97f0-1ee8970078db"
                                                                                                                 * },
                                                                                                                 * ]
                                                                                                                 * }
                                                                                                                 * @param requestBody
                                                                                                                 * @returns ListResponse Successful Response
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static searchGroupsSearchPost(
                                                                                                                    requestBody: SearchRequest,
                                                                                                                ): CancelablePromise<ListResponse> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'POST',
                                                                                                                        url: '/Groups/.search',
                                                                                                                        body: requestBody,
                                                                                                                        mediaType: 'application/json',
                                                                                                                        errors: {
                                                                                                                            400: `Bad request`,
                                                                                                                            404: `Not found`,
                                                                                                                            422: `Validation Error`,
                                                                                                                            500: `Internal server error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }

                                                                                                                /**
                                                                                                                 * On Get
                                                                                                                 * @param scimId
                                                                                                                 * @returns InviteResponse Successful Response
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static onGetInvitesScimIdGet(
                                                                                                                    scimId: string,
                                                                                                                ): CancelablePromise<InviteResponse> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'GET',
                                                                                                                        url: '/Invites/{scim_id}',
                                                                                                                        path: {
                                                                                                                            'scim_id': scimId,
                                                                                                                        },
                                                                                                                        errors: {
                                                                                                                            400: `Bad request`,
                                                                                                                            404: `Not found`,
                                                                                                                            422: `Validation Error`,
                                                                                                                            500: `Internal server error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }

                                                                                                                /**
                                                                                                                 * On Put
                                                                                                                 * @param scimId
                                                                                                                 * @param requestBody
                                                                                                                 * @returns InviteResponse Successful Response
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static onPutInvitesScimIdPut(
                                                                                                                    scimId: string,
                                                                                                                    requestBody: InviteUpdateRequest,
                                                                                                                ): CancelablePromise<InviteResponse> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'PUT',
                                                                                                                        url: '/Invites/{scim_id}',
                                                                                                                        path: {
                                                                                                                            'scim_id': scimId,
                                                                                                                        },
                                                                                                                        body: requestBody,
                                                                                                                        mediaType: 'application/json',
                                                                                                                        errors: {
                                                                                                                            400: `Bad request`,
                                                                                                                            404: `Not found`,
                                                                                                                            422: `Validation Error`,
                                                                                                                            500: `Internal server error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }

                                                                                                                /**
                                                                                                                 * On Delete
                                                                                                                 * @param scimId
                                                                                                                 * @returns void
                                                                                                                 * @throws ApiError
                                                                                                                 */
                                                                                                                public static onDeleteInvitesScimIdDelete(
                                                                                                                    scimId: string,
                                                                                                                ): CancelablePromise<void> {
                                                                                                                    return __request(OpenAPI, {
                                                                                                                        method: 'DELETE',
                                                                                                                        url: '/Invites/{scim_id}',
                                                                                                                        path: {
                                                                                                                            'scim_id': scimId,
                                                                                                                        },
                                                                                                                        errors: {
                                                                                                                            400: `Bad request`,
                                                                                                                            404: `Not found`,
                                                                                                                            422: `Validation Error`,
                                                                                                                            500: `Internal server error`,
                                                                                                                        },
                                                                                                                    });
                                                                                                                }

                                                                                                                /**
                                                                                                                 * On Post
                                                                                                                 * POST /Invites  HTTP/1.1
                                                                                                                 * Host: example.com
                                                                                                                 * Accept: application/scim+json
                                                                                                                 * Content-Type: application/scim+json
                                                                                                                 * Authorization: Bearer h480djs93hd8
                                                                                                                 * Content-Length: ...
                                                                                                                 *
                                                                                                                 * {
                                                                                                                     * 'schemas': ['https://scim.eduid.se/schema/nutid/invite/v1',
                                                                                                                     * 'https://scim.eduid.se/schema/nutid/user/v1'],
                                                                                                                     * 'expiresAt': '2021-03-02T14:35:52',
                                                                                                                     * 'groups': [],
                                                                                                                     * 'phoneNumbers': [
                                                                                                                         * {'type': 'fax', 'value': 'tel:+461234567', 'primary': True},
                                                                                                                         * {'type': 'home', 'value': 'tel:+5-555-555-5555', 'primary': False},
                                                                                                                         * ],
                                                                                                                         * 'meta': {
                                                                                                                             * 'location': 'http://localhost:8000/Invites/fb96a6d0-1837-4c3b-9945-4249c476875c',
                                                                                                                             * 'resourceType': 'Invite',
                                                                                                                             * 'created': '2020-09-03T14:35:52.381881',
                                                                                                                             * 'version': 'W/"5f50ff48df3ce45b48394eb2"',
                                                                                                                             * 'lastModified': '2020-09-03T14:35:52.388959',
                                                                                                                             * },
                                                                                                                             * 'nationalIdentityNumber': '190102031234',
                                                                                                                             * 'id': 'fb96a6d0-1837-4c3b-9945-4249c476875c',
                                                                                                                             * 'preferredLanguage': 'se-SV',
                                                                                                                             * 'sendEmail': True,
                                                                                                                             * 'name': {
                                                                                                                                 * 'familyName': 'Testsson',
                                                                                                                                 * 'middleName': 'Testaren',
                                                                                                                                 * 'formatted': 'Test T. Testsson',
                                                                                                                                 * 'givenName': 'Test',
                                                                                                                                 * },
                                                                                                                                 * 'finishURL': 'https://finish.example.com',
                                                                                                                                 * 'https://scim.eduid.se/schema/nutid/user/v1': {
                                                                                                                                     * 'profiles': {'student': {'attributes': {'displayName': 'Test'}, 'data': {}}}
                                                                                                                                     * },
                                                                                                                                     * 'emails': [
                                                                                                                                         * {'type': 'other', 'value': 'johnsmith@example.com', 'primary': True},
                                                                                                                                         * {'type': 'home', 'value': 'johnsmith2@example.com', 'primary': False},
                                                                                                                                         * ],
                                                                                                                                         * }
                                                                                                                                         * @param requestBody
                                                                                                                                         * @returns InviteResponse Successful Response
                                                                                                                                         * @throws ApiError
                                                                                                                                         */
                                                                                                                                        public static onPostInvitesPost(
                                                                                                                                            requestBody: InviteCreateRequest,
                                                                                                                                        ): CancelablePromise<InviteResponse> {
                                                                                                                                            return __request(OpenAPI, {
                                                                                                                                                method: 'POST',
                                                                                                                                                url: '/Invites',
                                                                                                                                                body: requestBody,
                                                                                                                                                mediaType: 'application/json',
                                                                                                                                                errors: {
                                                                                                                                                    400: `Bad request`,
                                                                                                                                                    404: `Not found`,
                                                                                                                                                    422: `Validation Error`,
                                                                                                                                                    500: `Internal server error`,
                                                                                                                                                },
                                                                                                                                            });
                                                                                                                                        }

                                                                                                                                        /**
                                                                                                                                         * Search
                                                                                                                                         * POST /Invites/.search
                                                                                                                                         * Host: scim.eduid.se
                                                                                                                                         * Accept: application/scim+json
                                                                                                                                         *
                                                                                                                                         * {
                                                                                                                                             * "schemas": ["urn:ietf:params:scim:api:messages:2.0:SearchRequest"],
                                                                                                                                             * "attributes": ["id"],
                                                                                                                                             * "filter": "meta.lastModified ge "2020-09-14T12:49:45"",
                                                                                                                                             * "encryptionKey": "h026jGKrSW%2BTTekkA8Y8mv8%2FGqkGgAfLzaj3ucD3STQ"
                                                                                                                                             * "startIndex": 1,
                                                                                                                                             * "count": 1
                                                                                                                                             * }
                                                                                                                                             *
                                                                                                                                             * HTTP/1.1 200 OK
                                                                                                                                             * Content-Type: application/scim+json
                                                                                                                                             * Location: https://example.com/Invites/.search
                                                                                                                                             *
                                                                                                                                             * {
                                                                                                                                                 * "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
                                                                                                                                                 * "totalResults": 1,
                                                                                                                                                 * "itemsPerPage": 1,
                                                                                                                                                 * "startIndex": 1,
                                                                                                                                                 * "Resources": [
                                                                                                                                                     * {
                                                                                                                                                         * "id": "fb96a6d0-1837-4c3b-9945-4249c476875c",
                                                                                                                                                         * }
                                                                                                                                                         * ]
                                                                                                                                                         * }
                                                                                                                                                         * @param requestBody
                                                                                                                                                         * @returns ListResponse Successful Response
                                                                                                                                                         * @throws ApiError
                                                                                                                                                         */
                                                                                                                                                        public static searchInvitesSearchPost(
                                                                                                                                                            requestBody: SearchRequest,
                                                                                                                                                        ): CancelablePromise<ListResponse> {
                                                                                                                                                            return __request(OpenAPI, {
                                                                                                                                                                method: 'POST',
                                                                                                                                                                url: '/Invites/.search',
                                                                                                                                                                body: requestBody,
                                                                                                                                                                mediaType: 'application/json',
                                                                                                                                                                errors: {
                                                                                                                                                                    400: `Bad request`,
                                                                                                                                                                    404: `Not found`,
                                                                                                                                                                    422: `Validation Error`,
                                                                                                                                                                    500: `Internal server error`,
                                                                                                                                                                },
                                                                                                                                                            });
                                                                                                                                                        }

                                                                                                                                                        /**
                                                                                                                                                         * On Get
                                                                                                                                                         * @param scimId
                                                                                                                                                         * @returns EventResponse Successful Response
                                                                                                                                                         * @throws ApiError
                                                                                                                                                         */
                                                                                                                                                        public static onGetEventsScimIdGet(
                                                                                                                                                            scimId: string,
                                                                                                                                                        ): CancelablePromise<EventResponse> {
                                                                                                                                                            return __request(OpenAPI, {
                                                                                                                                                                method: 'GET',
                                                                                                                                                                url: '/Events/{scim_id}',
                                                                                                                                                                path: {
                                                                                                                                                                    'scim_id': scimId,
                                                                                                                                                                },
                                                                                                                                                                errors: {
                                                                                                                                                                    400: `Bad request`,
                                                                                                                                                                    404: `Not found`,
                                                                                                                                                                    422: `Validation Error`,
                                                                                                                                                                    500: `Internal server error`,
                                                                                                                                                                },
                                                                                                                                                            });
                                                                                                                                                        }

                                                                                                                                                        /**
                                                                                                                                                         * On Post
                                                                                                                                                         * POST /Events  HTTP/1.1
                                                                                                                                                         * Host: example.com
                                                                                                                                                         * Accept: application/scim+json
                                                                                                                                                         * Content-Type: application/scim+json
                                                                                                                                                         * Authorization: Bearer h480djs93hd8
                                                                                                                                                         * Content-Length: ...
                                                                                                                                                         *
                                                                                                                                                         * {
                                                                                                                                                             * 'schemas': ['https://scim.eduid.se/schema/nutid/event/core-v1',
                                                                                                                                                             * 'https://scim.eduid.se/schema/nutid/event/v1'],
                                                                                                                                                             * 'https://scim.eduid.se/schema/nutid/event/v1': {
                                                                                                                                                                 * 'ref': {'resourceType': 'User',
                                                                                                                                                                 * 'id': '199745a8-a4f5-46b9-9ae9-531da967bfb1',
                                                                                                                                                                 * 'externalId': 'test@example.org'
                                                                                                                                                                 * },
                                                                                                                                                                 * 'data': {'create_test': True},
                                                                                                                                                                 * 'expiresAt': '2021-02-23T14:36:15+00:00',
                                                                                                                                                                 * 'level': 'debug',
                                                                                                                                                                 * 'source': 'eduid.se',
                                                                                                                                                                 * 'timestamp': '2021-02-18T14:36:15+00:00'
                                                                                                                                                                 * }
                                                                                                                                                                 * }
                                                                                                                                                                 * @param requestBody
                                                                                                                                                                 * @returns EventResponse Successful Response
                                                                                                                                                                 * @throws ApiError
                                                                                                                                                                 */
                                                                                                                                                                public static onPostEventsPost(
                                                                                                                                                                    requestBody: EventCreateRequest,
                                                                                                                                                                ): CancelablePromise<EventResponse> {
                                                                                                                                                                    return __request(OpenAPI, {
                                                                                                                                                                        method: 'POST',
                                                                                                                                                                        url: '/Events',
                                                                                                                                                                        body: requestBody,
                                                                                                                                                                        mediaType: 'application/json',
                                                                                                                                                                        errors: {
                                                                                                                                                                            400: `Bad request`,
                                                                                                                                                                            404: `Not found`,
                                                                                                                                                                            422: `Validation Error`,
                                                                                                                                                                            500: `Internal server error`,
                                                                                                                                                                        },
                                                                                                                                                                    });
                                                                                                                                                                }

                                                                                                                                                                /**
                                                                                                                                                                 * Healthy
                                                                                                                                                                 * @returns StatusResponse Successful Response
                                                                                                                                                                 * @throws ApiError
                                                                                                                                                                 */
                                                                                                                                                                public static healthyStatusHealthyGet(): CancelablePromise<StatusResponse> {
                                                                                                                                                                    return __request(OpenAPI, {
                                                                                                                                                                        method: 'GET',
                                                                                                                                                                        url: '/status/healthy',
                                                                                                                                                                    });
                                                                                                                                                                }

                                                                                                                                                            }
