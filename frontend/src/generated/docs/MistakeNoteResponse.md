
# MistakeNoteResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`question` | [QuestionRef](QuestionRef.md)
`memo` | string
`learning` | string
`status` | string
`wrongCount` | number
`correctStreak` | number
`nextReviewAt` | Date

## Example

```typescript
import type { MistakeNoteResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "question": null,
  "memo": null,
  "learning": null,
  "status": null,
  "wrongCount": null,
  "correctStreak": null,
  "nextReviewAt": null,
} satisfies MistakeNoteResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MistakeNoteResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


