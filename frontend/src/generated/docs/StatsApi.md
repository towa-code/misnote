# StatsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getSummaryV1StatsSummaryGet**](StatsApi.md#getsummaryv1statssummaryget) | **GET** /v1/stats/summary | Get Summary |



## getSummaryV1StatsSummaryGet

> StatsSummary getSummaryV1StatsSummaryGet()

Get Summary

克服率の分子と分母。母数は「一度でも間違えた問題」＝ mistake_note 全件。

### Example

```ts
import {
  Configuration,
  StatsApi,
} from '';
import type { GetSummaryV1StatsSummaryGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: HTTPBearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatsApi(config);

  try {
    const data = await api.getSummaryV1StatsSummaryGet();
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

[**StatsSummary**](StatsSummary.md)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

