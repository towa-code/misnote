# QuestionsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createQuestionV1QuestionsPost**](QuestionsApi.md#createquestionv1questionspost) | **POST** /v1/questions | Create Question |
| [**deleteQuestionV1QuestionsQuestionIdDelete**](QuestionsApi.md#deletequestionv1questionsquestioniddelete) | **DELETE** /v1/questions/{question_id} | Delete Question |
| [**getQuestionV1QuestionsQuestionIdGet**](QuestionsApi.md#getquestionv1questionsquestionidget) | **GET** /v1/questions/{question_id} | Get Question |
| [**listQuestionsV1QuestionsGet**](QuestionsApi.md#listquestionsv1questionsget) | **GET** /v1/questions | List Questions |
| [**updateQuestionV1QuestionsQuestionIdPut**](QuestionsApi.md#updatequestionv1questionsquestionidput) | **PUT** /v1/questions/{question_id} | Update Question |



## createQuestionV1QuestionsPost

> QuestionResponse createQuestionV1QuestionsPost(questionCreate)

Create Question

### Example

```ts
import {
  Configuration,
  QuestionsApi,
} from '';
import type { CreateQuestionV1QuestionsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new QuestionsApi();

  const body = {
    // QuestionCreate
    questionCreate: ...,
  } satisfies CreateQuestionV1QuestionsPostRequest;

  try {
    const data = await api.createQuestionV1QuestionsPost(body);
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
| **questionCreate** | [QuestionCreate](QuestionCreate.md) |  | |

### Return type

[**QuestionResponse**](QuestionResponse.md)

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


## deleteQuestionV1QuestionsQuestionIdDelete

> deleteQuestionV1QuestionsQuestionIdDelete(questionId)

Delete Question

### Example

```ts
import {
  Configuration,
  QuestionsApi,
} from '';
import type { DeleteQuestionV1QuestionsQuestionIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new QuestionsApi();

  const body = {
    // string
    questionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteQuestionV1QuestionsQuestionIdDeleteRequest;

  try {
    const data = await api.deleteQuestionV1QuestionsQuestionIdDelete(body);
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
| **questionId** | `string` |  | [Defaults to `undefined`] |

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


## getQuestionV1QuestionsQuestionIdGet

> QuestionResponse getQuestionV1QuestionsQuestionIdGet(questionId)

Get Question

### Example

```ts
import {
  Configuration,
  QuestionsApi,
} from '';
import type { GetQuestionV1QuestionsQuestionIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new QuestionsApi();

  const body = {
    // string
    questionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetQuestionV1QuestionsQuestionIdGetRequest;

  try {
    const data = await api.getQuestionV1QuestionsQuestionIdGet(body);
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
| **questionId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**QuestionResponse**](QuestionResponse.md)

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


## listQuestionsV1QuestionsGet

> Array&lt;QuestionResponse&gt; listQuestionsV1QuestionsGet(subjectId, unitId, limit, offset)

List Questions

### Example

```ts
import {
  Configuration,
  QuestionsApi,
} from '';
import type { ListQuestionsV1QuestionsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new QuestionsApi();

  const body = {
    // string (optional)
    subjectId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    unitId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ListQuestionsV1QuestionsGetRequest;

  try {
    const data = await api.listQuestionsV1QuestionsGet(body);
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
| **subjectId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **unitId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `100`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**Array&lt;QuestionResponse&gt;**](QuestionResponse.md)

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


## updateQuestionV1QuestionsQuestionIdPut

> QuestionResponse updateQuestionV1QuestionsQuestionIdPut(questionId, questionUpdate)

Update Question

### Example

```ts
import {
  Configuration,
  QuestionsApi,
} from '';
import type { UpdateQuestionV1QuestionsQuestionIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new QuestionsApi();

  const body = {
    // string
    questionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // QuestionUpdate
    questionUpdate: ...,
  } satisfies UpdateQuestionV1QuestionsQuestionIdPutRequest;

  try {
    const data = await api.updateQuestionV1QuestionsQuestionIdPut(body);
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
| **questionId** | `string` |  | [Defaults to `undefined`] |
| **questionUpdate** | [QuestionUpdate](QuestionUpdate.md) |  | |

### Return type

[**QuestionResponse**](QuestionResponse.md)

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

