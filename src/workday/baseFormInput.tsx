import React from 'react'
import { getElement, getElements } from '../utils/getElements'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto'
import {v4 as uuid4} from 'uuid'
import { client } from '../inject/inject'
import { App, attachReactApp } from '../App'
// import { AnswerResponse } from '../utils/storage'

export type SaveStatus = "ok" | "loading" | "error"

export type FieldPath = {
  page: string
  section: string
  fieldType: string
  fieldName: string
}

export type FieldSnapshot = FieldPath & {
  answer: any | null
}



/**
 * given the regular dom element, get the props of the corresponding
 * react element. available as a property `__reactProps${random suffix}`
 * on the regular dom element
 */
export const getReactProps = (element: HTMLElement): any => {
  for (const key in element) {
    if (key.startsWith('__reactProps')) return element[key]
  }
}


// export interface FormInputSubclass<AnswerType> {
//   listenForChanges:  () => never
//   currentValue: () => AnswerType | null
//   answer: () =>  Promise<AnswerType | null>
// }

export class BaseFormInput {
  /**
   * The xpath used to identify the element.
   * Ususally an enclosing div since the label is contained within.
   */
  static XPATH: string
  /**
   * The parent element of the field. Should include the field and the
   * label.
   */
  element: HTMLElement
  uuid: string
  /**
   * used to send message events from this class to the rendered
   * react app.
   */
  reactMessageEventId: `reactMessage-${string}`
  /**
   * Should be the subclasses name. `this.constructor.name` doesn't
   * work because the name changes when the js is minified and this name
   * is used as part of the path to the answer.
   */
  fieldType: string

  constructor(element: HTMLElement) {
    this.element = element
    this.uuid = uuid4()
    this.reactMessageEventId = `reactMessage-${this.uuid}`
    /** prevents the element from being registered twice */
    this.element.setAttribute('job-app-filler', this.uuid)
    this.listenForChanges()
    attachReactApp(<App inputClass={this} />, element)
  }

  static async autoDiscover(node: Node = document) {
    const elements = getElements(node, this.XPATH)
    elements.forEach((el) => {
      if (!el.hasAttribute('job-app-filler')) {
        const input = new this(el)
      }
    })
  }

  /**
   * Listen for changes on the form field of the job site.
   * Logic depends on field structure
   * call `triggerReactUpdate` on each change.
   */
  listenForChanges(): void {
    throw new Error(
      "'listenForChanges' method must be implemented by all subclasses of BaseFormInput"
    )
  }

  /**
   * communicate with the react display element by dispatching
   * an event on the form field parent element for which the react
   * display element is listening for.
   */
  triggerReactUpdate() {
    this.element.dispatchEvent(new CustomEvent(this.reactMessageEventId))
  }

  public get page(): string {
    return getElement(document, './/h2').innerText
  }

  /**
   * can sometimes be overriden but is mostly the same.
   */
  public get fieldName(): string {
    return getElement(this.element, './/label').innerText
  }

  /**
   * A section is a grouping of fields that can be repeating
   * e.g. work history.
   * In such cases the form field name can appear twice on a page.
   */
  public get section(): string {
    // must always return a string, even a blank one
    return ''
  }

  public get path(): FieldPath {
    return {
      page: this.page,
      section: this.section,
      fieldType: this.fieldType,
      fieldName: this.fieldName,
    }
  }

  currentValue(): any {
    throw new Error(
      "Getter 'currentValue' must be implemented by all subclasses of BaseFormInput"
    )
    return ''
  }

  public get fieldSnapshot(): FieldSnapshot {
    return {
      ...this.path,
      answer: this.currentValue(),
    }
  }

  async save() {
    const response = await client.send('saveAnswer', this.fieldSnapshot)
    return response.ok
  }

  /**
   * base method.
   * specify the answers type in this method.
   */
  async fetchAnswer(): Promise<any> {
    const res = await client.send('getAnswer', this.path)
    if (res.ok) {
      return res.data
    } else {
      console.error(res)
    }
  }

  async hasAnswer(): Promise<boolean> {
    const data = this.fetchAnswer()
    return 'answer' in data
  }

  /**
   * use in subclass to specify the answer type.
   * Usage: just call fetchAnswer inside it.
   */
  async answer(): Promise<any> {
    throw new Error(
      "'answer' method must be implemented by all subclasses of BaseFormInput"
    )
  }

  async isFilled(): Promise<boolean> {
    const answer = await this.answer()
    return answer === this.currentValue
  }

  async fill() {
    console.log('in base fill method')
  }
}