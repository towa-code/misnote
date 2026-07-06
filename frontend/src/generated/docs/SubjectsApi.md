# SubjectsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createSubjectV1SubjectsPost**](SubjectsApi.md#createsubjectv1subjectspost) | **POST** /v1/subjects | Create Subject |
| [**deleteSubjectV1SubjectsSubjectIdDelete**](SubjectsApi.md#deletesubjectv1subjectssubjectiddelete) | **DELETE** /v1/subjects/{subject_id} | Delete Subject |
| [**listSubjectsV1SubjectsGet**](SubjectsApi.md#listsubjectsv1subjectsget) | **GET** /v1/subjects | List Subjects |
| [**updateSubjectV1SubjectsSubjectIdPut**](SubjectsApi.md#updatesubjectv1subjectssubjectidput) | **PUT** /v1/subjects/{subject_id} | Update Subject |



## createSubjectV1SubjectsPost

> SubjectResponse createSubjectV1SubjectsPost(subjectCreate)

Create Subject

### Example

```ts
import {
  Configuration,
  SubjectsApi,
} from '';
import type { CreateSubjectV1SubjectsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SubjectsApi();

  const body = {
    // SubjectCreate
    subjectCreate: ...,
  } satisfies CreateSubjectV1SubjectsPostRequest;

  try {
    const data = await api.createSubjectV1SubjectsPost(body);
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
| **subjectCreate** | [SubjectCreate](SubjectCreate.md) |  | |

### Return type

[**SubjectResponse**](SubjectResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSubjectV1SubjectsSubjectIdDelete

> deleteSubjectV1SubjectsSubjectIdDelete(subjectId)

Delete Subject

### Example

```ts
import {
  Configuration,
  SubjectsApi,
} from '';
import type { DeleteSubjectV1SubjectsSubjectIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SubjectsApi();

  const body = {
    // string
    subjectId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteSubjectV1SubjectsSubjectIdDeleteRequest;

  try {
    const data = await api.deleteSubjectV1SubjectsSubjectIdDelete(body);
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
| **subjectId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | Successful Response |  -  |
| **422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSubjectsV1SubjectsGet

> Array&lt;SubjectResponse&gt; listSubjectsV1SubjectsGet()

List Subjects

### Example

```ts
import {
  Configuration,
  SubjectsApi,
} from '';
import type { ListSubjectsV1SubjectsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SubjectsApi();

  try {
    const data = await api.listSubjectsV1SubjectsGet();
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

[**Array&lt;SubjectResponse&gt;**](SubjectResponse.md)

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


## updateSubjectV1SubjectsSubjectIdPut

> SubjectResponse updateSubjectV1SubjectsSubjectIdPut(subjectId, subjectUpdate)

Update Subject

### Example

```ts
import {
  Configuration,
  SubjectsApi,
} from '';
import type { UpdateSubjectV1SubjectsSubjectIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SubjectsApi();

  const body = {
    // string
    subjectId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SubjectUpdate
    subjectUpdate: ...,
  } satisfies UpdateSubjectV1SubjectsSubjectIdPutRequest;

  try {
    const data = await api.updateSubjectV1SubjectsSubjectIdPut(body);
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
| **subjectId** | `string` |  | [Defaults to `undefined`] |
| **subjectUpdate** | [SubjectUpdate](SubjectUpdate.md) |  | |

### Return type

[**SubjectResponse**](SubjectResponse.md)

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

