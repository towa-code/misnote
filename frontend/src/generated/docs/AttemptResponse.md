
# AttemptResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`questionId` | string
`userAnswer` | string
`isCorrect` | boolean
`answeredAt` | Date
`mistakeNoteId` | string
`correctStreak` | number
`masterySuggested` | boolean

## Example

```typescript
import type { AttemptResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "questionId": null,
  "userAnswer": null,
  "isCorrect": null,
  "answeredAt": null,
  "mistakeNoteId": null,
  "correctStreak": null,
  "masterySuggested": null,
} satisfies AttemptResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AttemptResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


