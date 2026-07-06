# AttemptsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createAttemptV1QuestionsQuestionIdAttemptsPost**](AttemptsApi.md#createattemptv1questionsquestionidattemptspost) | **POST** /v1/questions/{question_id}/attempts | Create Attempt |
| [**listAttemptsV1QuestionsQuestionIdAttemptsGet**](AttemptsApi.md#listattemptsv1questionsquestionidattemptsget) | **GET** /v1/questions/{question_id}/attempts | List Attempts |



## createAttemptV1QuestionsQuestionIdAttemptsPost

> AttemptResponse createAttemptV1QuestionsQuestionIdAttemptsPost(questionId, attemptCreate)

Create Attempt

### Example

```ts
import {
  Configuration,
  AttemptsApi,
} from '';
import type { CreateAttemptV1QuestionsQuestionIdAttemptsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AttemptsApi();

  const body = {
    // string
    questionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // AttemptCreate
    attemptCreate: ...,
  } satisfies CreateAttemptV1QuestionsQuestionIdAttemptsPostRequest;

  try {
    const data = await api.createAttemptV1QuestionsQuestionIdAttemptsPost(body);
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
| **attemptCreate** | [AttemptCreate](AttemptCreate.md) |  | |

### Return type

[**AttemptResponse**](AttemptResponse.md)

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


## listAttemptsV1QuestionsQuestionIdAttemptsGet

> Array&lt;AttemptHistoryItem&gt; listAttemptsV1QuestionsQuestionIdAttemptsGet(questionId)

List Attempts

### Example

```ts
import {
  Configuration,
  AttemptsApi,
} from '';
import type { ListAttemptsV1QuestionsQuestionIdAttemptsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AttemptsApi();

  const body = {
    // string
    questionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ListAttemptsV1QuestionsQuestionIdAttemptsGetRequest;

  try {
    const data = await api.listAttemptsV1QuestionsQuestionIdAttemptsGet(body);
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

[**Array&lt;AttemptHistoryItem&gt;**](AttemptHistoryItem.md)

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

