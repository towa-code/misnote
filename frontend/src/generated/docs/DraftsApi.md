# DraftsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createDraftV1DraftsPost**](DraftsApi.md#createdraftv1draftspost) | **POST** /v1/drafts | Create Draft |
| [**deleteDraftV1DraftsDraftIdDelete**](DraftsApi.md#deletedraftv1draftsdraftiddelete) | **DELETE** /v1/drafts/{draft_id} | Delete Draft |
| [**getDraftV1DraftsDraftIdGet**](DraftsApi.md#getdraftv1draftsdraftidget) | **GET** /v1/drafts/{draft_id} | Get Draft |
| [**listDraftsV1DraftsGet**](DraftsApi.md#listdraftsv1draftsget) | **GET** /v1/drafts | List Drafts |



## createDraftV1DraftsPost

> DraftResponse createDraftV1DraftsPost(draftCreate)

Create Draft

### Example

```ts
import {
  Configuration,
  DraftsApi,
} from '';
import type { CreateDraftV1DraftsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: HTTPBearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DraftsApi(config);

  const body = {
    // DraftCreate
    draftCreate: ...,
  } satisfies CreateDraftV1DraftsPostRequest;

  try {
    const data = await api.createDraftV1DraftsPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **draftCreate** | [DraftCreate](DraftCreate.md) |  | |

### Return type

[**DraftResponse**](DraftResponse.md)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteDraftV1DraftsDraftIdDelete

> deleteDraftV1DraftsDraftIdDelete(draftId)

Delete Draft

### Example

```ts
import {
  Configuration,
  DraftsApi,
} from '';
import type { DeleteDraftV1DraftsDraftIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: HTTPBearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DraftsApi(config);

  const body = {
    // string
    draftId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteDraftV1DraftsDraftIdDeleteRequest;

  try {
    const data = await api.deleteDraftV1DraftsDraftIdDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **draftId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDraftV1DraftsDraftIdGet

> DraftResponse getDraftV1DraftsDraftIdGet(draftId)

Get Draft

### Example

```ts
import {
  Configuration,
  DraftsApi,
} from '';
import type { GetDraftV1DraftsDraftIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: HTTPBearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DraftsApi(config);

  const body = {
    // string
    draftId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetDraftV1DraftsDraftIdGetRequest;

  try {
    const data = await api.getDraftV1DraftsDraftIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **draftId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**DraftResponse**](DraftResponse.md)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listDraftsV1DraftsGet

> Array&lt;DraftResponse&gt; listDraftsV1DraftsGet(limit, offset)

List Drafts

### Example

```ts
import {
  Configuration,
  DraftsApi,
} from '';
import type { ListDraftsV1DraftsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: HTTPBearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new DraftsApi(config);

  const body = {
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListDraftsV1DraftsGetRequest;

  try {
    const data = await api.listDraftsV1DraftsGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **limit** | `number` |  | [Optional] [Defaults to `100`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**Array&lt;DraftResponse&gt;**](DraftResponse.md)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

