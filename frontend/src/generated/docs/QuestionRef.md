
# QuestionRef


## Properties

Name | Type
------------ | -------------
`id` | string
`subject` | [SubjectRef](SubjectRef.md)
`unit` | [UnitRef](UnitRef.md)
`questionText` | string
`correctAnswer` | string

## Example

```typescript
import type { QuestionRef } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "subject": null,
  "unit": null,
  "questionText": null,
  "correctAnswer": null,
} satisfies QuestionRef

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as QuestionRef
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


