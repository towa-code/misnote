# UnitsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createUnitV1SubjectsSubjectIdUnitsPost**](UnitsApi.md#createunitv1subjectssubjectidunitspost) | **POST** /v1/subjects/{subject_id}/units | Create Unit |
| [**deleteUnitV1UnitsUnitIdDelete**](UnitsApi.md#deleteunitv1unitsunitiddelete) | **DELETE** /v1/units/{unit_id} | Delete Unit |
| [**listUnitsV1SubjectsSubjectIdUnitsGet**](UnitsApi.md#listunitsv1subjectssubjectidunitsget) | **GET** /v1/subjects/{subject_id}/units | List Units |
| [**updateUnitV1UnitsUnitIdPut**](UnitsApi.md#updateunitv1unitsunitidput) | **PUT** /v1/units/{unit_id} | Update Unit |



## createUnitV1SubjectsSubjectIdUnitsPost

> UnitResponse createUnitV1SubjectsSubjectIdUnitsPost(subjectId, unitCreate)

Create Unit

### Example

```ts
import {
  Configuration,
  UnitsApi,
} from '';
import type { CreateUnitV1SubjectsSubjectIdUnitsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UnitsApi();

  const body = {
    // string
    subjectId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // UnitCreate
    unitCreate: ...,
  } satisfies CreateUnitV1SubjectsSubjectIdUnitsPostRequest;

  try {
    const data = await api.createUnitV1SubjectsSubjectIdUnitsPost(body);
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
| **unitCreate** | [UnitCreate](UnitCreate.md) |  | |

### Return type

[**UnitResponse**](UnitResponse.md)

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


## deleteUnitV1UnitsUnitIdDelete

> deleteUnitV1UnitsUnitIdDelete(unitId)

Delete Unit

### Example

```ts
import {
  Configuration,
  UnitsApi,
} from '';
import type { DeleteUnitV1UnitsUnitIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UnitsApi();

  const body = {
    // string
    unitId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteUnitV1UnitsUnitIdDeleteRequest;

  try {
    const data = await api.deleteUnitV1UnitsUnitIdDelete(body);
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
| **unitId** | `string` |  | [Defaults to `undefined`] |

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


## listUnitsV1SubjectsSubjectIdUnitsGet

> Array&lt;UnitResponse&gt; listUnitsV1SubjectsSubjectIdUnitsGet(subjectId)

List Units

### Example

```ts
import {
  Configuration,
  UnitsApi,
} from '';
import type { ListUnitsV1SubjectsSubjectIdUnitsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UnitsApi();

  const body = {
    // string
    subjectId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListUnitsV1SubjectsSubjectIdUnitsGetRequest;

  try {
    const data = await api.listUnitsV1SubjectsSubjectIdUnitsGet(body);
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

[**Array&lt;UnitResponse&gt;**](UnitResponse.md)

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


## updateUnitV1UnitsUnitIdPut

> UnitResponse updateUnitV1UnitsUnitIdPut(unitId, unitUpdate)

Update Unit

### Example

```ts
import {
  Configuration,
  UnitsApi,
} from '';
import type { UpdateUnitV1UnitsUnitIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UnitsApi();

  const body = {
    // string
    unitId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // UnitUpdate
    unitUpdate: ...,
  } satisfies UpdateUnitV1UnitsUnitIdPutRequest;

  try {
    const data = await api.updateUnitV1UnitsUnitIdPut(body);
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
| **unitId** | `string` |  | [Defaults to `undefined`] |
| **unitUpdate** | [UnitUpdate](UnitUpdate.md) |  | |

### Return type

[**UnitResponse**](UnitResponse.md)

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

