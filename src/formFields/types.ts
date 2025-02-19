export type FieldPath = {
    page: string
    section: string
    fieldType: string
    fieldName: string
  }
  
  export type FieldSnapshot<AnswerType=any> = FieldPath & {
    answer: AnswerType | null
  }