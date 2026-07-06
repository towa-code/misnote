# MistakeNotesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getNoteV1MistakeNotesNoteIdGet**](MistakeNotesApi.md#getnotev1mistakenotesnoteidget) | **GET** /v1/mistake-notes/{note_id} | Get Note |
| [**listActiveV1MistakeNotesGet**](MistakeNotesApi.md#listactivev1mistakenotesget) | **GET** /v1/mistake-notes | List Active |
| [**listMasteredV1MistakeNotesMasteredGet**](MistakeNotesApi.md#listmasteredv1mistakenotesmasteredget) | **GET** /v1/mistake-notes/mastered | List Mastered |
| [**listTodayV1MistakeNotesTodayGet**](MistakeNotesApi.md#listtodayv1mistakenotestodayget) | **GET** /v1/mistake-notes/today | List Today |
| [**updateNoteV1MistakeNotesNoteIdPut**](MistakeNotesApi.md#updatenotev1mistakenotesnoteidput) | **PUT** /v1/mistake-notes/{note_id} | Update Note |
| [**updateStatusV1MistakeNotesNoteIdStatusPut**](MistakeNotesApi.md#updatestatusv1mistakenotesnoteidstatusput) | **PUT** /v1/mistake-notes/{note_id}/status | Update Status |



## getNoteV1MistakeNotesNoteIdGet

> MistakeNoteResponse getNoteV1MistakeNotesNoteIdGet(noteId)

Get Note

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { GetNoteV1MistakeNotesNoteIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  const body = {
    // string
    noteId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetNoteV1MistakeNotesNoteIdGetRequest;

  try {
    const data = await api.getNoteV1MistakeNotesNoteIdGet(body);
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
| **noteId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**MistakeNoteResponse**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listActiveV1MistakeNotesGet

> Array&lt;MistakeNoteResponse&gt; listActiveV1MistakeNotesGet(limit, offset)

List Active

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { ListActiveV1MistakeNotesGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  const body = {
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListActiveV1MistakeNotesGetRequest;

  try {
    const data = await api.listActiveV1MistakeNotesGet(body);
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

[**Array&lt;MistakeNoteResponse&gt;**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listMasteredV1MistakeNotesMasteredGet

> Array&lt;MistakeNoteResponse&gt; listMasteredV1MistakeNotesMasteredGet(limit, offset)

List Mastered

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { ListMasteredV1MistakeNotesMasteredGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  const body = {
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListMasteredV1MistakeNotesMasteredGetRequest;

  try {
    const data = await api.listMasteredV1MistakeNotesMasteredGet(body);
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

[**Array&lt;MistakeNoteResponse&gt;**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTodayV1MistakeNotesTodayGet

> Array&lt;MistakeNoteResponse&gt; listTodayV1MistakeNotesTodayGet()

List Today

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { ListTodayV1MistakeNotesTodayGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  try {
    const data = await api.listTodayV1MistakeNotesTodayGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;MistakeNoteResponse&gt;**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateNoteV1MistakeNotesNoteIdPut

> MistakeNoteResponse updateNoteV1MistakeNotesNoteIdPut(noteId, mistakeNoteUpdate)

Update Note

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { UpdateNoteV1MistakeNotesNoteIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  const body = {
    // string
    noteId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // MistakeNoteUpdate
    mistakeNoteUpdate: ...,
  } satisfies UpdateNoteV1MistakeNotesNoteIdPutRequest;

  try {
    const data = await api.updateNoteV1MistakeNotesNoteIdPut(body);
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
| **noteId** | `string` |  | [Defaults to `undefined`] |
| **mistakeNoteUpdate** | [MistakeNoteUpdate](MistakeNoteUpdate.md) |  | |

### Return type

[**MistakeNoteResponse**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateStatusV1MistakeNotesNoteIdStatusPut

> MistakeNoteResponse updateStatusV1MistakeNotesNoteIdStatusPut(noteId, mistakeNoteStatusUpdate)

Update Status

### Example

```ts
import {
  Configuration,
  MistakeNotesApi,
} from '';
import type { UpdateStatusV1MistakeNotesNoteIdStatusPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new MistakeNotesApi();

  const body = {
    // string
    noteId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // MistakeNoteStatusUpdate
    mistakeNoteStatusUpdate: ...,
  } satisfies UpdateStatusV1MistakeNotesNoteIdStatusPutRequest;

  try {
    const data = await api.updateStatusV1MistakeNotesNoteIdStatusPut(body);
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
| **noteId** | `string` |  | [Defaults to `undefined`] |
| **mistakeNoteStatusUpdate** | [MistakeNoteStatusUpdate](MistakeNoteStatusUpdate.md) |  | |

### Return type

[**MistakeNoteResponse**](MistakeNoteResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

