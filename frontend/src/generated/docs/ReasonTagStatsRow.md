
# ReasonTagStatsRow

教科 × 単元 × 原因タグ 1組ぶんの集計。unit / reason_tag が null の組もそのまま1行になる。

## Properties

Name | Type
------------ | -------------
`subjectId` | string
`subjectName` | string
`unitId` | string
`unitName` | string
`reasonTag` | string
`noteCount` | number
`masteredCount` | number
`wrongCountSum` | number

## Example

```typescript
import type { ReasonTagStatsRow } from ''

// TODO: Update the object below with actual values
const example = {
  "subjectId": null,
  "subjectName": null,
  "unitId": null,
  "unitName": null,
  "reasonTag": null,
  "noteCount": null,
  "masteredCount": null,
  "wrongCountSum": null,
} satisfies ReasonTagStatsRow

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReasonTagStatsRow
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


